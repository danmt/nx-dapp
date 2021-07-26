import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TOKENS_FEATURE_KEY, State, tokensAdapter } from './tokens.reducer';

// Lookup the 'Tokens' feature state managed by NgRx
export const getTokensState = createFeatureSelector<State>(TOKENS_FEATURE_KEY);

const { selectAll, selectEntities } = tokensAdapter.getSelectors();

export const getTokensLoaded = createSelector(
  getTokensState,
  (state: State) => state.loaded
);

export const getTokensError = createSelector(
  getTokensState,
  (state: State) => state.error
);

export const getAllTokens = createSelector(getTokensState, (state: State) =>
  selectAll(state)
);

export const getTokensEntities = createSelector(
  getTokensState,
  (state: State) => selectEntities(state)
);

export const getSelectedId = createSelector(
  getTokensState,
  (state: State) => state.selectedId
);

export const getSelected = createSelector(
  getTokensEntities,
  getSelectedId,
  (entities, selectedId) => (selectedId ? entities[selectedId] : undefined)
);
