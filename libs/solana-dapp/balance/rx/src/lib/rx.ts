import { ofType } from '@nx-dapp/shared/operators/of-type';
import {
  MintTokenAccount,
  ParsedAccountBase,
  TokenAccount,
} from '@nx-dapp/solana-dapp/account/base';
import { createBalance, TokenDetails } from '@nx-dapp/solana-dapp/balance/base';
import { SerumMarket } from '@nx-dapp/solana-dapp/market/base';
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
  map,
  observeOn,
  scan,
  shareReplay,
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
  LoadTokensAction,
  LoadUserAccountsAction,
} from './actions';
import { balanceInitialState, reducer } from './state';
import { Action, IBalanceService } from './types';
import { TokenInfo } from '@solana/spl-token-registry';

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
    combineLatest([
      this.actions$.pipe(ofType<LoadTokensAction>('loadTokens')),
      this.actions$.pipe(ofType<LoadMintTokensAction>('loadMintTokens')),
    ]),
    combineLatest([
      this.actions$.pipe(ofType<LoadMintAccountsAction>('loadMintAccounts')),
      this.actions$.pipe(ofType<LoadUserAccountsAction>('loadUserAccounts')),
      this.actions$.pipe(
        ofType<LoadMarketAccountsAction>('loadMarketAccounts')
      ),
    ]),
    combineLatest([
      this.actions$.pipe(ofType<LoadMarketByMintAction>('loadMarketByMint')),
      this.actions$.pipe(
        ofType<LoadMarketMintAccountsAction>('loadMarketMintAccounts')
      ),
      this.actions$.pipe(
        ofType<LoadMarketIndicatorAccountsAction>('loadMarketIndicatorAccounts')
      ),
    ]),
  ]).pipe(
    map(
      ([
        [{ payload: tokens }, { payload: mintTokens }],
        [
          { payload: mintAccounts },
          { payload: userAccounts },
          { payload: marketAccounts },
        ],
        [
          { payload: marketByMint },
          { payload: marketMintAccounts },
          { payload: marketIndicatorAccounts },
        ],
      ]) =>
        new LoadBalancesAction(
          mintAccounts
            .filter((mintAccount) =>
              mintTokens.some(
                ({ address }) => address === mintAccount.pubkey.toBase58()
              )
            )
            .map((mintAccount) =>
              createBalance(
                userAccounts.filter(
                  (userAccount) =>
                    userAccount.info.mint.toBase58() ===
                    mintAccount.pubkey.toBase58()
                ),
                mintTokens.find(
                  (token) => token.address === mintAccount.pubkey.toBase58()
                ) || null,
                tokens.get(mintAccount.pubkey.toBase58()) || null,
                mintAccount,
                marketByMint,
                marketAccounts,
                marketMintAccounts,
                marketIndicatorAccounts
              )
            )
        )
    )
  );

  constructor(mintTokens: TokenDetails[]) {
    this.runEffects([this.loadBalances$]);

    this.loadMintTokens(mintTokens);
  }

  private runEffects(effects: Observable<Action>[]) {
    merge(...effects)
      .pipe(takeUntil(this._destroy), observeOn(asyncScheduler))
      .subscribe((action) => this._dispatcher.next(action));
  }

  loadMintAccounts(mintAccounts: MintTokenAccount[]) {
    this._dispatcher.next(new LoadMintAccountsAction(mintAccounts));
  }

  loadUserAccounts(userAccounts: TokenAccount[]) {
    this._dispatcher.next(new LoadUserAccountsAction(userAccounts));
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

  loadTokens(tokens: Map<string, TokenInfo>) {
    this._dispatcher.next(new LoadTokensAction(tokens));
  }

  destroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
