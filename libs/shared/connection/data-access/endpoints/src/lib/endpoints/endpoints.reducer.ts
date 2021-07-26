import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { ENV as ChainID } from '@solana/spl-token-registry';
import { clusterApiUrl } from '@solana/web3.js';

import * as EndpointsActions from './endpoints.actions';
import { Endpoint, ENV } from './types';

export const ENDPOINTS_FEATURE_KEY = 'endpoints';

export interface State extends EntityState<Endpoint> {
  selectedId: string; // which Endpoints record has been selected
}

export interface EndpointsPartialState {
  readonly [ENDPOINTS_FEATURE_KEY]: State;
}

export const endpointsAdapter: EntityAdapter<Endpoint> =
  createEntityAdapter<Endpoint>();

export const initialState: State = endpointsAdapter.getInitialState({
  // set initial required properties
  loaded: false,
  selectedId: 'mainnet-beta',
});

const endpointsReducer = createReducer(
  initialState,
  on(EndpointsActions.init, (state) =>
    endpointsAdapter.setAll(
      [
        {
          id: 'mainnet-beta' as ENV,
          url: 'https://solana-api.projectserum.com/',
          chainID: ChainID.MainnetBeta,
        },
        {
          id: 'testnet' as ENV,
          url: clusterApiUrl('testnet'),
          chainID: ChainID.Testnet,
        },
        {
          id: 'devnet' as ENV,
          url: clusterApiUrl('devnet'),
          chainID: ChainID.Devnet,
        },
        {
          id: 'localnet' as ENV,
          url: 'http://127.0.0.1:8899',
          chainID: ChainID.Devnet,
        },
      ],
      {
        ...state,
        loaded: false,
        error: null,
      }
    )
  ),
  on(EndpointsActions.selectEndpoint, (state, { selectedId }) => ({
    ...state,
    selectedId,
  }))
);

export function reducer(state: State | undefined, action: Action) {
  return endpointsReducer(state, action);
}
