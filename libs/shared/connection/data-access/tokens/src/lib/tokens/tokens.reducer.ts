import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { TokenInfo } from '@solana/spl-token-registry';

import * as TokensActions from './tokens.actions';

export const TOKENS_FEATURE_KEY = 'tokens';

export interface State extends EntityState<TokenInfo> {
  selectedId?: string; // which Tokens record has been selected
  loaded: boolean; // has the Tokens list been loaded
  error?: string | null; // last known error (if any)
}

export interface TokensPartialState {
  readonly [TOKENS_FEATURE_KEY]: State;
}

export const tokensAdapter: EntityAdapter<TokenInfo> =
  createEntityAdapter<TokenInfo>({
    selectId: (token: TokenInfo) => token.address,
  });

export const initialState: State = tokensAdapter.getInitialState({
  // set initial required properties
  loaded: false,
});

const tokensReducer = createReducer(
  initialState,
  on(TokensActions.init, (state) => ({ ...state, loaded: false, error: null })),
  on(TokensActions.loadTokensSuccess, (state, { tokens }) =>
    tokensAdapter.setAll(tokens, { ...state, loaded: true })
  ),
  on(TokensActions.loadTokensFailure, (state, { error }) => ({
    ...state,
    error,
  }))
);

export function reducer(state: State | undefined, action: Action) {
  return tokensReducer(state, action);
}
