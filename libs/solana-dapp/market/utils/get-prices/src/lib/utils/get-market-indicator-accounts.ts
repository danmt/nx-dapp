import { ParsedAccountBase } from '@nx-dapp/solana-dapp/account/types';
import { getMultipleAccounts } from '@nx-dapp/solana-dapp/account/utils/get-multiple-accounts';
import { OrderBookParser } from '@nx-dapp/solana-dapp/account/utils/serializer';
import { Connection, PublicKey } from '@solana/web3.js';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const getMarketIndicatorAccount = (
  connection: Connection,
  marketAccount: ParsedAccountBase
) =>
  getMultipleAccounts(
    connection,
    [marketAccount.info.asks.toBase58(), marketAccount.info.bids.toBase58()],
    'single'
  ).pipe(
    map(({ array: marketIndicatorAccounts, keys: marketIndicatorAddresses }) =>
      marketIndicatorAccounts.map((marketIndicatorAccount, index) =>
        OrderBookParser(
          new PublicKey(marketIndicatorAddresses[index]),
          marketIndicatorAccount
        )
      )
    )
  );

export const getMarketIndicatorAccounts = (
  connection: Connection,
  marketAccounts: ParsedAccountBase[]
): Observable<ParsedAccountBase[]> =>
  forkJoin(
    marketAccounts.map((marketAccount) =>
      getMarketIndicatorAccount(connection, marketAccount)
    )
  ).pipe(
    map((marketIndicatorAccountsList) => [
      ...marketIndicatorAccountsList
        .reduce((marketIndicatorAccounts, accounts) => {
          accounts.forEach((account) => {
            marketIndicatorAccounts.set(account.pubkey.toBase58(), account);
          });

          return new Map<string, ParsedAccountBase>(marketIndicatorAccounts);
        }, new Map<string, ParsedAccountBase>())
        .values(),
    ])
  );
