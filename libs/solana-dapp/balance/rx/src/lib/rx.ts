import { ofType } from '@nx-dapp/shared/operators/of-type';
import {
  MintTokenAccount,
  ParsedAccountBase,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account/base';
import { getBalances, TokenDetails } from '@nx-dapp/solana-dapp/balance/base';
import { SerumMarket } from '@nx-dapp/solana-dapp/market/base';
import { TokenInfo } from '@solana/spl-token-registry';
import {
  asyncScheduler,
  BehaviorSubject,
  combineLatest,
  merge,
  Observable,
  Subject,
} from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  observeOn,
  scan,
  shareReplay,
  switchMap,
  takeUntil,
} from 'rxjs/operators';

import {
  InitAction,
  LoadBalancesAction,
  LoadMarketAccountsAction,
  LoadMarketByMintAction,
  LoadMarketIndicatorAccountsAction,
  LoadMarketMintAccountsAction,
  LoadMintAccountsAction,
  LoadMintTokensAction,
  LoadNetworkTokensAction,
  LoadTokenAccountsAction,
  LoadWalletConnectedAction,
  ResetAction,
} from './actions';
import { balanceInitialState, reducer } from './state';
import { Action, IBalanceService } from './types';

export class BalanceService implements IBalanceService {
  private readonly _destroy = new Subject();
  private readonly _dispatcher = new BehaviorSubject<Action>(new InitAction());
  actions$ = this._dispatcher.asObservable();
  state$ = this._dispatcher.pipe(
    scan(reducer, balanceInitialState),
    shareReplay({
      refCount: false,
      bufferSize: 1,
    })
  );
  balances$ = this.state$.pipe(
    map(({ balances }) => balances.sort((a, b) => b.tokenInUSD - a.tokenInUSD)),
    distinctUntilChanged()
  );
  totalInUSD$ = this.state$.pipe(
    map(({ totalInUSD }) => totalInUSD),
    distinctUntilChanged()
  );

  private loadBalances$ = combineLatest([
    // Useful data
    combineLatest([
      this.actions$.pipe(ofType<LoadNetworkTokensAction>('loadNetworkTokens')),
      this.actions$.pipe(ofType<LoadMintTokensAction>('loadMintTokens')),
    ]),
    // User data
    combineLatest([
      this.actions$.pipe(ofType<LoadMintAccountsAction>('loadMintAccounts')),
      this.actions$.pipe(ofType<LoadTokenAccountsAction>('loadTokenAccounts')),
    ]),
    // Market
    combineLatest([
      this.actions$.pipe(
        ofType<LoadMarketAccountsAction>('loadMarketAccounts')
      ),
      this.actions$.pipe(ofType<LoadMarketByMintAction>('loadMarketByMint')),
      this.actions$.pipe(
        ofType<LoadMarketMintAccountsAction>('loadMarketMintAccounts')
      ),
      this.actions$.pipe(
        ofType<LoadMarketIndicatorAccountsAction>('loadMarketIndicatorAccounts')
      ),
    ]),
    this.actions$.pipe(
      ofType<LoadWalletConnectedAction>('loadWalletConnected')
    ),
  ]).pipe(
    filter(([, , , { payload: walletConnected }]) => walletConnected),
    switchMap(
      ([
        [{ payload: networkTokens }, { payload: mintTokens }],
        [{ payload: mintAccounts }, { payload: tokenAccounts }],
        [
          { payload: marketAccounts },
          { payload: marketByMint },
          { payload: marketMintAccounts },
          { payload: marketIndicatorAccounts },
        ],
      ]) =>
        getBalances(
          mintAccounts,
          tokenAccounts,
          mintTokens,
          networkTokens,
          marketByMint,
          marketAccounts,
          marketMintAccounts,
          marketIndicatorAccounts
        ).pipe(map((balances) => new LoadBalancesAction(balances)))
    )
  );

  private reset$ = this.actions$.pipe(
    ofType<LoadWalletConnectedAction>('loadWalletConnected'),
    filter(({ payload: connected }) => !connected),
    map(() => new ResetAction())
  );

  constructor(mintTokens: TokenDetails[]) {
    this.runEffects([this.loadBalances$, this.reset$]);

    this.loadMintTokens(mintTokens);
  }

  private runEffects(effects: Observable<Action>[]) {
    merge(...effects)
      .pipe(takeUntil(this._destroy), observeOn(asyncScheduler))
      .subscribe((action) => this._dispatcher.next(action));
  }

  loadMintAccounts(mintAccounts: Map<string, MintTokenAccount>) {
    this._dispatcher.next(new LoadMintAccountsAction(mintAccounts));
  }

  loadTokenAccounts(tokenAccounts: Map<string, TokenAccount>) {
    this._dispatcher.next(new LoadTokenAccountsAction(tokenAccounts));
  }

  loadMarketAccounts(marketAccounts: Map<string, ParsedAccountBase>) {
    this._dispatcher.next(new LoadMarketAccountsAction(marketAccounts));
  }

  loadMarketMintAccounts(marketMintAccounts: Map<string, ParsedAccountBase>) {
    this._dispatcher.next(new LoadMarketMintAccountsAction(marketMintAccounts));
  }

  loadMarketIndicatorAccounts(
    marketIndicatorAccounts: Map<string, ParsedAccountBase>
  ) {
    this._dispatcher.next(
      new LoadMarketIndicatorAccountsAction(marketIndicatorAccounts)
    );
  }

  loadMarketByMint(marketByMint: Map<string, SerumMarket>) {
    this._dispatcher.next(new LoadMarketByMintAction(marketByMint));
  }

  loadMintTokens(mintTokens: TokenDetails[]) {
    this._dispatcher.next(new LoadMintTokensAction(mintTokens));
  }

  loadNetworkTokens(networkTokens: Map<string, TokenInfo>) {
    this._dispatcher.next(new LoadNetworkTokensAction(networkTokens));
  }

  loadWalletConnected(walletConnected: boolean) {
    this._dispatcher.next(new LoadWalletConnectedAction(walletConnected));
  }

  destroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
