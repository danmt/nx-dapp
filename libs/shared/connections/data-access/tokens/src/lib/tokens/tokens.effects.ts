import { Injectable } from '@angular/core';
import { Actions, createEffect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
  Endpoint,
  getSelected as getSelectedEndpoint,
} from '@nx-dapp/shared/connections/data-access/endpoints';
import { TokenListProvider } from '@solana/spl-token-registry';
import { defer, from, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';

import * as TokensActions from './tokens.actions';

@Injectable()
export class TokensEffects {
  tokensList$ = createEffect(() =>
    this.store.select(getSelectedEndpoint).pipe(
      filter((value: Endpoint | null): value is Endpoint => value !== null),
      switchMap((chain) =>
        from(defer(() => new TokenListProvider().resolve())).pipe(
          map((res) =>
            TokensActions.loadTokensSuccess({
              tokens: res
                .filterByChainId(chain.chainID)
                .excludeByTag('nft')
                .getList(),
            })
          ),
          catchError((error) => of(TokensActions.loadTokensFailure({ error })))
        )
      )
    )
  );

  constructor(private readonly actions$: Actions, private store: Store) {}
}
