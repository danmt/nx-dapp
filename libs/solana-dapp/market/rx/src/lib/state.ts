import { ParsedAccountBase } from '@nx-dapp/solana-dapp/account/base';
import { SerumMarket } from '@nx-dapp/solana-dapp/market/base';

import {
  LoadMarketAccountsAction,
  LoadMarketByMintAction,
  LoadMarketIndicatorAccountsAction,
  LoadMarketMintAccountsAction,
} from './actions';
import { Action, MarketState } from './types';

export const marketInitialState: MarketState = {
  marketByMint: new Map<string, SerumMarket>(),
  marketMintAccounts: new Map<string, ParsedAccountBase>(),
  marketIndicatorAccounts: new Map<string, ParsedAccountBase>(),
  marketAccounts: new Map<string, ParsedAccountBase>(),
};

export const reducer = (state: MarketState, action: Action) => {
  switch (action.type) {
    case 'loadMarketByMint':
      return {
        ...state,
        marketByMint: (action as LoadMarketByMintAction).payload,
      };
    case 'loadMarketAccounts':
      return {
        ...state,
        marketAccounts: [
          ...(action as LoadMarketAccountsAction).payload.values(),
        ].reduce(
          (marketAccounts, account) =>
            marketAccounts.set(account.pubkey.toBase58(), account),
          new Map(state.marketAccounts)
        ),
      };
    case 'loadMarketMintAccounts':
      return {
        ...state,
        marketMintAccounts: [
          ...(action as LoadMarketMintAccountsAction).payload.values(),
        ].reduce(
          (marketMintAccounts, account) =>
            marketMintAccounts.set(account.pubkey.toBase58(), account),
          new Map(state.marketMintAccounts)
        ),
      };
    case 'loadMarketIndicatorAccounts':
      return {
        ...state,
        marketIndicatorAccounts: [
          ...(action as LoadMarketIndicatorAccountsAction).payload.values(),
        ].reduce(
          (marketIndicatorAccounts, account) =>
            marketIndicatorAccounts.set(account.pubkey.toBase58(), account),
          new Map(state.marketIndicatorAccounts)
        ),
      };
    case 'reset':
      return {
        ...state,
        marketByMint: new Map<string, SerumMarket>(),
        marketMintAccounts: new Map<string, ParsedAccountBase>(),
        marketIndicatorAccounts: new Map<string, ParsedAccountBase>(),
        marketAccounts: new Map<string, ParsedAccountBase>(),
      };
    default:
      return state;
  }
};
