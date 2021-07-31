import { ofType } from '@nx-dapp/shared/operators/of-type';
import {
  MintTokenAccount,
  TokenAccount,
} from '@nx-dapp/solana/account-adapter/base';
import { fromLamports } from '@nx-dapp/solana/balance-adapter/base';
import { SerumMarket } from '@nx-dapp/solana/market-adapter/base';
import {
  asyncScheduler,
  BehaviorSubject,
  combineLatest,
  from,
  merge,
  Observable,
  Subject,
} from 'rxjs';
import {
  concatMap,
  filter,
  map,
  mergeMap,
  observeOn,
  scan,
  shareReplay,
  takeUntil,
  toArray,
} from 'rxjs/operators';

import {
  InitAction,
  LoadMarketByMintAction,
  LoadMintAccountsAction,
  LoadUserAccountsAction,
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

  private loadBalances$ = combineLatest([
    this.actions$.pipe(ofType<LoadMintAccountsAction>('loadMintAccounts')),
    this.actions$.pipe(ofType<LoadUserAccountsAction>('loadUserAccounts')),
    this.actions$.pipe(ofType<LoadMarketByMintAction>('loadMarketByMint')),
  ]).pipe(
    concatMap(
      ([
        { payload: mintAccounts },
        { payload: userAccounts },
        { payload: marketByMint },
      ]) =>
        from(mintAccounts).pipe(
          mergeMap((mintAccount) =>
            from(userAccounts).pipe(
              filter(
                (userAccount) =>
                  userAccount.info.mint.toBase58() ===
                  mintAccount.pubkey.toBase58()
              ),
              toArray(),
              map((accounts) => {
                const balanceLamports = accounts.reduce(
                  (res, item) => (res += item.info.amount.toNumber()),
                  0
                );
                const balance = fromLamports(balanceLamports, mintAccount.info);

                return {
                  balanceLamports,
                  accounts: userAccounts.sort((a, b) =>
                    b.info.amount.sub(a.info.amount).toNumber()
                  ),
                  mintAccount,
                  balance,
                  // calcular balance en USD
                  // calcular has balance
                };
              })
            )
          ),
          toArray()
        )
    ),
    map(() => new InitAction())
  );

  constructor() {
    this.runEffects([this.loadBalances$]);
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

  loadMarketByMint(marketByMint: Map<string, SerumMarket>) {
    this._dispatcher.next(new LoadMarketByMintAction(marketByMint));
  }

  destroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
