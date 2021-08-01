import { InjectionToken } from '@angular/core';
import { ConnectionService } from '@nx-dapp/solana-dapp/connection/rx';

export const CONNECTION_SERVICE = new InjectionToken<ConnectionService>(
  'connection-service'
);

export const connectionServiceProvider = () => ({
  provide: CONNECTION_SERVICE,
  useFactory: () => new ConnectionService(),
});
