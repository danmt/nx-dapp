import { ModuleWithProviders, NgModule } from '@angular/core';

import { connectionServiceProvider } from './provider';

@NgModule({})
export class ConnectionModule {
  static forRoot(): ModuleWithProviders<ConnectionModule> {
    return {
      ngModule: ConnectionModule,
      providers: [connectionServiceProvider()],
    };
  }
}
