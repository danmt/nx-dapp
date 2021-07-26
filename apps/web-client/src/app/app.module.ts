import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ConnectionsDropdownModule } from '@nx-dapp/shared/connections/ui/dropdown';
import { DataAccessModule as TokensDataAccessModule } from '@nx-dapp/shared/connections/data-access/tokens';
import { EndpointsModule as EndpointsDataAccessModule } from '@nx-dapp/shared/connections/data-access/endpoints';
import { ConnectionsModule as ConnectionsDataAccessModule } from '@nx-dapp/shared/connections/data-access/connections';
import { WalletModule } from '@nx-dapp/shared/wallets/ui/dropdown';

import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { StoreRouterConnectingModule } from '@ngrx/router-store';

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
    WalletModule,
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
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
