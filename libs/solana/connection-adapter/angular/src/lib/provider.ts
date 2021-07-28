import { InjectionToken } from '@angular/core';
import { ConnectionService } from '@nx-dapp/solana/connection-adapter/rx';

export const CONNECTION_SERVICE = new InjectionToken<ConnectionService>(
  'connection-service'
);

export const connectionServiceProvider = () => ({
  provide: CONNECTION_SERVICE,
  useFactory: () => new ConnectionService(),
});
