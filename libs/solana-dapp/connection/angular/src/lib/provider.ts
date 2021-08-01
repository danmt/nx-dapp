import { InjectionToken } from '@angular/core';
import { Endpoint } from '@nx-dapp/solana-dapp/connection/base';
import { ConnectionService } from '@nx-dapp/solana-dapp/connection/rx';

export const CONNECTION_SERVICE = new InjectionToken<ConnectionService>(
  'connection-service'
);

export const connectionServiceProvider = (
  endpoints: Endpoint[],
  defaultEndpoint: string
) => ({
  provide: CONNECTION_SERVICE,
  useFactory: () => new ConnectionService(endpoints, defaultEndpoint),
});
