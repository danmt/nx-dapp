import { ModuleWithProviders, NgModule } from '@angular/core';
import { Network } from '@nx-dapp/solana-dapp/connection/base';

import { connectionServiceProvider } from './provider';

@NgModule({})
export class ConnectionModule {
  static forRoot(
    networks: Network[],
    defaultNetwork: string
  ): ModuleWithProviders<ConnectionModule> {
    return {
      ngModule: ConnectionModule,
      providers: [connectionServiceProvider(networks, defaultNetwork)],
    };
  }
}
