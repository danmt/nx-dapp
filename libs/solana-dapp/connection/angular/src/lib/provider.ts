import { InjectionToken } from '@angular/core';
import { Network } from '@nx-dapp/solana-dapp/connection/base';
import { ConnectionService } from '@nx-dapp/solana-dapp/connection/rx';

export const CONNECTION_SERVICE = new InjectionToken<ConnectionService>(
  'connection-service'
);

export const connectionServiceProvider = (
  networks: Network[],
  defaultNetwork: string
) => ({
  provide: CONNECTION_SERVICE,
  useFactory: () => new ConnectionService(networks, defaultNetwork),
});
