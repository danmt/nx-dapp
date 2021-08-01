import { ModuleWithProviders, NgModule } from '@angular/core';
import { Endpoint } from '@nx-dapp/solana-dapp/connection/base';

import { connectionServiceProvider } from './provider';

@NgModule({})
export class ConnectionModule {
  static forRoot(
    endpoints: Endpoint[],
    defaultEndpoint: string
  ): ModuleWithProviders<ConnectionModule> {
    return {
      ngModule: ConnectionModule,
      providers: [connectionServiceProvider(endpoints, defaultEndpoint)],
    };
  }
}
