import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import { ofType } from '@nx-dapp/shared/operators/of-type';
import {
  DexMarketParser,
  getMultipleAccounts,
  MintParser,
  OrderBookParser,
  TokenAccountParser,
  wrapNativeAccount,
} from '@nx-dapp/solana/account-adapter/base';
import { SerumMarket } from '@nx-dapp/solana/market-adapter/base';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import {
  asyncScheduler,
  BehaviorSubject,
  combineLatest,
  defer,
  from,
  merge,
  Observable,
  Subject,
} from 'rxjs';
import {
  distinctUntilChanged,
  map,
  mergeMap,
  observeOn,
  scan,
  shareReplay,
  switchMap,
  takeUntil,
  toArray,
} from 'rxjs/operators';

import {
  ChangeAccountAction,
  GetMintAccountsAction,
  InitAction,
  LoadConnectionAction,
  LoadMarketAccountsAction,
  LoadMarketByMintAction,
  LoadMarketHelperAccountsAction,
  LoadMintAccountsAction,
  LoadNativeAccountAction,
  LoadTokenAccountsAction,
  LoadWalletConnectedAction,
  LoadWalletPublicKeyAction,
} from './actions';
import { accountInitialState, reducer } from './state';
import { Action, IAccountService } from './types';

export class AccountService implements IAccountService {
  private readonly _destroy = new Subject();
  private readonly _dispatcher = new BehaviorSubject<Action>(new InitAction());
  actions$ = this._dispatcher.asObservable();
  state$ = this._dispatcher.pipe(
    scan(reducer, accountInitialState),
    shareReplay({
      refCount: false,
      bufferSize: 1,
    })
  );
  tokenAccounts$ = this.state$.pipe(
    map(({ tokenAccounts }) => tokenAccounts),
    distinctUntilChanged()
  );
  nativeAccount$ = this.state$.pipe(
    map(({ nativeAccount }) => nativeAccount),
    distinctUntilChanged()
  );
  userAccounts$ = combineLatest([
    this.tokenAccounts$,
    this.nativeAccount$.pipe(isNotNull),
  ]).pipe(
    map(([tokenAccounts, nativeAccount]) => [...tokenAccounts, nativeAccount])
  );
  mintAccounts$ = this.state$.pipe(
    map(({ mintAccounts }) => mintAccounts),
    distinctUntilChanged()
  );
  marketAccounts$ = this.state$.pipe(
    map(({ marketAccounts }) => marketAccounts),
    distinctUntilChanged()
  );
  marketHelperAccounts$ = this.state$.pipe(
    map(({ marketHelperAccounts }) => marketHelperAccounts),
    distinctUntilChanged()
  );

  private loadNativeAccount$ = combineLatest([
    this.actions$.pipe(ofType<LoadConnectionAction>('loadConnection')),
    this.actions$.pipe(
      ofType<LoadWalletPublicKeyAction>('loadWalletPublicKey')
    ),
  ]).pipe(
    switchMap(([{ payload: connection }, { payload: walletPublicKey }]) =>
      from(defer(() => connection.getAccountInfo(walletPublicKey))).pipe(
        isNotNull,
        map(
          (account) =>
            new LoadNativeAccountAction(
              wrapNativeAccount(walletPublicKey, account)
            )
        )
      )
    )
  );

  private accountChanged$ = combineLatest([
    this.actions$.pipe(ofType<ChangeAccountAction>('changeAccount')),
    this.actions$.pipe(
      ofType<LoadWalletPublicKeyAction>('loadWalletPublicKey')
    ),
  ]).pipe(
    map(
      ([{ payload: account }, { payload: walletPublicKey }]) =>
        new LoadNativeAccountAction(
          TokenAccountParser(walletPublicKey, account)
        )
    )
  );

  private loadTokenAccounts$ = combineLatest([
    this.actions$.pipe(ofType<LoadConnectionAction>('loadConnection')),
    this.actions$.pipe(
      ofType<LoadWalletPublicKeyAction>('loadWalletPublicKey')
    ),
  ]).pipe(
    switchMap(([{ payload: connection }, { payload: walletPublicKey }]) =>
      from(
        defer(() =>
          connection.getTokenAccountsByOwner(walletPublicKey, {
            programId: TOKEN_PROGRAM_ID,
          })
        )
      ).pipe(
        map(
          (accounts) =>
            new LoadTokenAccountsAction({
              tokenAccounts: accounts.value
                .filter((info) => info.account.data.length > 0)
                .map((info) =>
                  TokenAccountParser(
                    new PublicKey(info.pubkey.toBase58()),
                    info.account
                  )
                ),
              walletPublicKey,
            })
        )
      )
    )
  );

  private loadMintAccounts$ = combineLatest([
    this.actions$.pipe(ofType<LoadConnectionAction>('loadConnection')),
    this.actions$.pipe(ofType<GetMintAccountsAction>('getMintAccounts')),
  ]).pipe(
    mergeMap(([{ payload: connection }, { payload: mintKeys }]) =>
      combineLatest(
        mintKeys.map((mintKey) =>
          from(defer(() => connection.getAccountInfo(mintKey))).pipe(
            isNotNull,
            map((account) => MintParser(mintKey, account))
          )
        )
      ).pipe(map((accounts) => new LoadMintAccountsAction(accounts)))
    )
  );

  private loadMarketAccounts$ = combineLatest([
    this.actions$.pipe(ofType<LoadConnectionAction>('loadConnection')),
    this.actions$.pipe(ofType<LoadMarketByMintAction>('loadMarketByMint')),
  ]).pipe(
    switchMap(([{ payload: connection }, { payload: marketByMint }]) => {
      const allMarkets = [...marketByMint.values()].map((market) =>
        market.marketInfo.address.toBase58()
      );

      return from(
        defer(() => getMultipleAccounts(connection, allMarkets, 'single'))
      ).pipe(
        mergeMap(({ array: marketAccounts }) =>
          from(marketAccounts).pipe(
            map((marketAccount) => {
              const mintAddress = [...marketByMint.keys()].find((mint) =>
                marketByMint.get(mint)
              );

              if (!mintAddress) {
                return null;
              }

              const market = marketByMint.get(mintAddress);

              if (!market) {
                return null;
              }

              return DexMarketParser(market.marketInfo.address, marketAccount);
            }),
            isNotNull,
            toArray(),
            map((accounts) => new LoadMarketAccountsAction(accounts))
          )
        )
      );
    })
  );

  private loadMarketHelperAccounts$ = combineLatest([
    this.actions$.pipe(ofType<LoadConnectionAction>('loadConnection')),
    this.actions$.pipe(ofType<LoadMarketByMintAction>('loadMarketByMint')),
    this.actions$.pipe(ofType<LoadMarketAccountsAction>('loadMarketAccounts')),
  ]).pipe(
    switchMap(
      ([
        { payload: connection },
        { payload: marketByMint },
        { payload: marketAccounts },
      ]) =>
        from(marketByMint.values()).pipe(
          map((market) => market.marketInfo.address.toBase58()),
          map((marketAddress) => {
            const marketAccount = marketAccounts.find(
              (account) => account.pubkey.toBase58() === marketAddress
            );

            if (!marketAccount) {
              return [];
            }

            return [
              {
                address: marketAccount.info.baseMint.toBase58(),
                parser: MintParser,
              },
              {
                address: marketAccount.info.quoteMint.toBase58(),
                parser: MintParser,
              },
              {
                address: marketAccount.info.asks.toBase58(),
                parser: OrderBookParser,
              },
              {
                address: marketAccount.info.bids.toBase58(),
                parser: OrderBookParser,
              },
            ];
          }),
          mergeMap((accounts) =>
            from(
              defer(() =>
                getMultipleAccounts(
                  connection,
                  accounts.map(({ address }) => address),
                  'single'
                )
              )
            ).pipe(
              map(
                ({
                  array: marketHelperAccounts,
                  keys: marketHelperAddresses,
                }) =>
                  marketHelperAccounts.map((marketHelperAccount, index) =>
                    accounts[index].parser(
                      new PublicKey(marketHelperAddresses[index]),
                      marketHelperAccount
                    )
                  )
              )
            )
          )
        )
    ),
    map(
      (marketHelperAccounts) =>
        new LoadMarketHelperAccountsAction(marketHelperAccounts)
    )
  );

  constructor() {
    this.runEffects([
      this.loadTokenAccounts$,
      this.loadNativeAccount$,
      this.accountChanged$,
      this.loadMintAccounts$,
      this.loadMarketAccounts$,
      this.loadMarketHelperAccounts$,
    ]);
  }

  private runEffects(effects: Observable<Action>[]) {
    merge(...effects)
      .pipe(takeUntil(this._destroy), observeOn(asyncScheduler))
      .subscribe((action) => this._dispatcher.next(action));
  }

  loadConnection(connection: Connection) {
    this._dispatcher.next(new LoadConnectionAction(connection));
  }

  loadWalletPublicKey(publicKey: PublicKey) {
    this._dispatcher.next(new LoadWalletPublicKeyAction(publicKey));
  }

  loadWalletConnected(connected: boolean) {
    this._dispatcher.next(new LoadWalletConnectedAction(connected));
  }

  loadMarketByMint(marketByMint: Map<string, SerumMarket>) {
    this._dispatcher.next(new LoadMarketByMintAction(marketByMint));
  }

  changeAccount(account: AccountInfo<Buffer>) {
    this._dispatcher.next(new ChangeAccountAction(account));
  }

  getMintAccounts(publicKeys: PublicKey[]) {
    this._dispatcher.next(new GetMintAccountsAction(publicKeys));
  }

  destroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
