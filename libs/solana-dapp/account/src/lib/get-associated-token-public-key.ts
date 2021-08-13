import { TokenInstructions } from '@project-serum/serum';
import { ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { defer, from } from 'rxjs';
import { map } from 'rxjs/operators';

export const getAssociatedTokenPublicKey = (
  walletPubkey: PublicKey,
  mintPubkey: PublicKey
) =>
  from(
    defer(() =>
      PublicKey.findProgramAddress(
        [
          walletPubkey.toBuffer(),
          TokenInstructions.TOKEN_PROGRAM_ID.toBuffer(),
          mintPubkey.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    )
  ).pipe(map(([publicKey]) => publicKey));
