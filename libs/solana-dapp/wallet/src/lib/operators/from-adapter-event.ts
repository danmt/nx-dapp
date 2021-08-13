import { isNotNull } from '@nx-dapp/shared/utils/operators';
import {
  WalletAdapter,
  WalletAdapterEvents,
} from '@nx-dapp/solana-dapp/utils/types';
import { fromEventPattern, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export const fromAdapterEvent =
  (eventName: keyof WalletAdapterEvents) =>
  (source: Observable<WalletAdapter | null>) =>
    source.pipe(
      isNotNull,
      switchMap((adapter) =>
        fromEventPattern(
          (addHandler) => adapter.on(eventName, addHandler),
          (removeHandler) => adapter.off(eventName, removeHandler)
        )
      )
    );
