import { createAction, props } from '@ngrx/store';
import { TokenInfo } from '@solana/spl-token-registry';

export const init = createAction('[App] Init');

export const loadTokensSuccess = createAction(
  '[Tokens/API] Load Tokens Success',
  props<{ tokens: TokenInfo[] }>()
);

export const loadTokensFailure = createAction(
  '[Tokens/API] Load Tokens Failure',
  props<{ error: any }>()
);
