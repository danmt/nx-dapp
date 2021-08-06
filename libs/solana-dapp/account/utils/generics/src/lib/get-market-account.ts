import { MarketAccount } from '@nx-dapp/solana-dapp/account/types';
import { DexMarketParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { Commitment, Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { getAccount } from '..';

export const getMarketAccount = (
  connection: Connection,
  pubkey: PublicKey,
  commitment?: Commitment
): Observable<MarketAccount | null> =>
  getAccount(connection, pubkey, commitment || 'recent').pipe(
    map(
      (marketAccount) => marketAccount && DexMarketParser(pubkey, marketAccount)
    )
  );
