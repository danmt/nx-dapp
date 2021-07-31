import { ofType } from '@nx-dapp/shared/operators/of-type';
import {
  MintTokenAccount,
  ParsedAccountBase,
  TokenAccount,
} from '@nx-dapp/solana/account-adapter/base';
import { createBalances } from '@nx-dapp/solana/balance-adapter/base';
import { SerumMarket } from '@nx-dapp/solana/market-adapter/base';
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
  LoadMarketHelperAccountsAction,
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
  balances$ = this.state$.pipe(
    map(({ balances }) => balances),
    distinctUntilChanged()
  );

  private loadBalances$ = combineLatest([
    this.actions$.pipe(ofType<LoadMintAccountsAction>('loadMintAccounts')),
    this.actions$.pipe(ofType<LoadUserAccountsAction>('loadUserAccounts')),
    this.actions$.pipe(ofType<LoadMarketAccountsAction>('loadMarketAccounts')),
    this.actions$.pipe(ofType<LoadMarketByMintAction>('loadMarketByMint')),
    this.actions$.pipe(
      ofType<LoadMarketHelperAccountsAction>('loadMarketHelperAccounts')
    ),
  ]).pipe(
    map(
      ([
        { payload: mintAccounts },
        { payload: userAccounts },
        { payload: marketAccounts },
        { payload: marketByMint },
        { payload: marketHelperAccounts },
      ]) =>
        new LoadBalancesAction(
          mintAccounts.map((mintAccount) =>
            createBalances(
              userAccounts.filter(
                (userAccount) =>
                  userAccount.info.mint.toBase58() ===
                  mintAccount.pubkey.toBase58()
              ),
              mintAccount,
              marketByMint,
              marketAccounts,
              marketHelperAccounts
            )
          )
        )
    )
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

  loadMarketAccounts(marketAccounts: ParsedAccountBase[]) {
    this._dispatcher.next(new LoadMarketAccountsAction(marketAccounts));
  }

  loadMarketHelperAccounts(marketHelperAccounts: ParsedAccountBase[]) {
    this._dispatcher.next(
      new LoadMarketHelperAccountsAction(marketHelperAccounts)
    );
  }

  loadMarketByMint(marketByMint: Map<string, SerumMarket>) {
    this._dispatcher.next(new LoadMarketByMintAction(marketByMint));
  }

  destroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
