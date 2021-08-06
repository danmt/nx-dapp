import {
  MarketAccount,
  MintTokenAccount,
  OrderbookAccount,
  TokenAccount,
  TokenAccountInfo,
} from '@nx-dapp/solana-dapp/account/types';
import { u64 } from '@nx-dapp/solana-dapp/utils/u64';
import { Market, MARKETS, Orderbook } from '@project-serum/serum';
import { AccountLayout, MintInfo, MintLayout } from '@solana/spl-token';
import { AccountInfo, PublicKey } from '@solana/web3.js';

const deserializeAccount = (data: Buffer): TokenAccountInfo => {
  const accountInfo = AccountLayout.decode(data);
  accountInfo.mint = new PublicKey(accountInfo.mint);
  accountInfo.owner = new PublicKey(accountInfo.owner);
  accountInfo.amount = u64.fromBuffer(accountInfo.amount);

  if (accountInfo.delegateOption === 0) {
    accountInfo.delegate = null;
    accountInfo.delegatedAmount = new u64(0);
  } else {
    accountInfo.delegate = new PublicKey(accountInfo.delegate);
    accountInfo.delegatedAmount = u64.fromBuffer(accountInfo.delegatedAmount);
  }

  accountInfo.isInitialized = accountInfo.state !== 0;
  accountInfo.isFrozen = accountInfo.state === 2;

  if (accountInfo.isNativeOption === 1) {
    accountInfo.rentExemptReserve = u64.fromBuffer(accountInfo.isNative);
    accountInfo.isNative = true;
  } else {
    accountInfo.rentExemptReserve = null;
    accountInfo.isNative = false;
  }

  if (accountInfo.closeAuthorityOption === 0) {
    accountInfo.closeAuthority = null;
  } else {
    accountInfo.closeAuthority = new PublicKey(accountInfo.closeAuthority);
  }

  return accountInfo;
};

const deserializeMint = (data: Buffer): MintInfo => {
  if (data.length !== MintLayout.span) {
    throw new Error('Not a valid Mint');
  }

  const mintInfo = MintLayout.decode(data);

  if (mintInfo.mintAuthorityOption === 0) {
    mintInfo.mintAuthority = null;
  } else {
    mintInfo.mintAuthority = new PublicKey(mintInfo.mintAuthority);
  }

  mintInfo.supply = u64.fromBuffer(mintInfo.supply);
  mintInfo.isInitialized = mintInfo.isInitialized !== 0;

  if (mintInfo.freezeAuthorityOption === 0) {
    mintInfo.freezeAuthority = null;
  } else {
    mintInfo.freezeAuthority = new PublicKey(mintInfo.freezeAuthority);
  }

  return mintInfo;
};

export const TokenAccountParser = (
  pubKey: PublicKey,
  info: AccountInfo<Buffer>
) => {
  const buffer = Buffer.from(info.data);
  const data = deserializeAccount(buffer);

  const details = {
    pubkey: pubKey,
    account: {
      ...info,
    },
    info: data,
  } as TokenAccount;

  return details;
};

export const MintParser = (pubKey: PublicKey, info: AccountInfo<Buffer>) => {
  const buffer = Buffer.from(info.data);

  const data = deserializeMint(buffer);

  const details = {
    pubkey: pubKey,
    account: {
      ...info,
    },
    info: data,
  } as MintTokenAccount;

  return details;
};

const DEFAULT_DEX_ID = new PublicKey(
  'EUqojwWA2rd19FZrzeBncJsm38Jm1hEhE3zsmX3bRc2o'
);

export const DexMarketParser = (
  pubkey: PublicKey,
  account: AccountInfo<Buffer>
) => {
  const market = MARKETS.find((market) => market.address.equals(pubkey));
  const decoded = Market.getLayout(market?.programId || DEFAULT_DEX_ID).decode(
    account.data
  );

  const details = {
    pubkey,
    account: {
      ...account,
    },
    info: {
      ...decoded,
      programId: market?.programId || DEFAULT_DEX_ID,
    },
  } as MarketAccount;

  return details;
};

export const OrderBookParser = (id: PublicKey, acc: AccountInfo<Buffer>) => {
  const decoded = Orderbook.LAYOUT.decode(acc.data);

  const details = {
    pubkey: id,
    account: {
      ...acc,
    },
    info: decoded,
  } as OrderbookAccount;

  return details;
};
