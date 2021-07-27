import {
  WalletAdapter,
  WalletAdapterEvents,
} from '@nx-dapp/shared/wallet-adapter/base';
import { fromEventPattern, Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

export const isNotNull = <T>(source: Observable<T | null>) =>
  source.pipe(filter((adapter: T | null): adapter is T => adapter !== null));

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
