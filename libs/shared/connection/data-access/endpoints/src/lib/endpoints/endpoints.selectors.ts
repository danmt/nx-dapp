import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  ENDPOINTS_FEATURE_KEY,
  State,
  endpointsAdapter,
} from './endpoints.reducer';

// Lookup the 'Endpoints' feature state managed by NgRx
export const getEndpointsState = createFeatureSelector<State>(
  ENDPOINTS_FEATURE_KEY
);

const { selectAll, selectEntities } = endpointsAdapter.getSelectors();

export const getAllEndpoints = createSelector(
  getEndpointsState,
  (state: State) => selectAll(state)
);

export const getEndpointsEntities = createSelector(
  getEndpointsState,
  (state: State) => selectEntities(state)
);

export const getSelectedId = createSelector(
  getEndpointsState,
  (state: State) => state.selectedId
);

export const getSelected = createSelector(
  getEndpointsEntities,
  getSelectedId,
  (entities, selectedId) => {
    if (!selectedId) {
      return null;
    }

    const endpoint = entities[selectedId];

    if (!endpoint) {
      return null;
    }

    return endpoint;
  }
);
