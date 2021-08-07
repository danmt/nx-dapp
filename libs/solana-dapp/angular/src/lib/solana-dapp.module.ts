import { NgModule } from '@angular/core';

import {
  SolanaDappConnectionService,
  SolanaDappMarketService,
  SolanaDappNetworkService,
  SolanaDappWalletService,
} from './services';

@NgModule({
  providers: [
    SolanaDappConnectionService,
    SolanaDappMarketService,
    SolanaDappNetworkService,
    SolanaDappWalletService,
  ],
})
export class SolanaDappModule {}
