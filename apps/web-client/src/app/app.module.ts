import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ConnectionsModule as ConnectionsDataAccessModule } from '@nx-dapp/shared/connection/data-access/connections';
import { EndpointsModule as EndpointsDataAccessModule } from '@nx-dapp/shared/connection/data-access/endpoints';
import { DataAccessModule as TokensDataAccessModule } from '@nx-dapp/shared/connection/data-access/tokens';
import { ConnectionsDropdownModule } from '@nx-dapp/shared/connection/ui/connections-dropdown';
import { WalletsDropdownModule } from '@nx-dapp/shared/connection/ui/wallets-dropdown';
import { walletServiceProvider } from '@nx-dapp/shared/wallet-adapter/angular';
import {
  getPhantomWallet,
  getSolletWallet,
  getSolongWallet,
} from '@nx-dapp/shared/wallet-adapter/wallets';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot([], { initialNavigation: 'enabledBlocking' }),
    BrowserAnimationsModule,
    ConnectionsDropdownModule,
    ConnectionsDataAccessModule,
    TokensDataAccessModule,
    EndpointsDataAccessModule,
    WalletsDropdownModule,
    StoreModule.forRoot(
      {},
      {
        metaReducers: !environment.production ? [] : [],
        runtimeChecks: {
          strictActionImmutability: true,
          strictStateImmutability: true,
        },
      }
    ),
    EffectsModule.forRoot([]),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    StoreRouterConnectingModule.forRoot(),
  ],
  providers: [
    walletServiceProvider([
      getPhantomWallet(),
      getSolletWallet(),
      getSolongWallet(),
    ]),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
