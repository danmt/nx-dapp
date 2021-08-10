import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChangeNetworkService } from '@nx-dapp/application/networks/features/change-network';
import { ConnectWalletService } from '@nx-dapp/application/wallets/features/connect-wallet';
import { ViewWalletService } from '@nx-dapp/application/wallets/features/view-wallet';
import { isNotNull } from '@nx-dapp/shared/operators/not-null';
import {
  obscureWalletAddress,
  SolanaDappWalletService,
} from '@nx-dapp/solana-dapp/angular';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'nx-dapp-navigation',
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav
        #drawer
        class="sidenav"
        fixedInViewport
        [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
        [mode]="(isHandset$ | async) ? 'over' : 'side'"
        [opened]="(isHandset$ | async) === false"
      >
        <figure class="mx-4 mt-4 mb-2">
          <img src="assets/images/logo.jpeg" />
        </figure>
        <mat-nav-list>
          <a mat-list-item routerLink="/portfolios/view-portfolio">Portfolio</a>
          <div class="mt-8 px-4" *ngIf="connected$ | async">
            <button
              mat-raised-button
              color="warn"
              style="
                display: block;
                width: 80%;
                margin: 0 auto;
              "
              (click)="onDisconnectWallet()"
            >
              Disconnect
              <mat-icon
                aria-label="disconnect wallet"
                class="w-4 h-4 text-base leading-none"
              >
                logout
              </mat-icon>
            </button>
          </div>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button
            type="button"
            aria-label="Toggle sidenav"
            mat-icon-button
            (click)="drawer.toggle()"
            *ngIf="isHandset$ | async"
          >
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>

          <div *ngIf="(connected$ | async) === false" class="ml-auto">
            <button
              mat-raised-button
              color="accent"
              (click)="onConnectWallet()"
            >
              Connect
            </button>
          </div>

          <div *ngIf="connected$ | async" class="ml-auto flex items-center">
            {{ walletAddress$ | async }}
          </div>
          <button
            mat-mini-fab
            color="accent"
            [matMenuTriggerFor]="menu"
            class="ml-4"
          >
            <mat-icon>settings</mat-icon>
          </button>

          <mat-menu #menu="matMenu" class="w-52">
            <button
              *ngIf="connected$ | async"
              mat-menu-item
              (click)="onViewWallet()"
            >
              Wallet
            </button>
            <button
              mat-menu-item
              class="flex justify-between items-center"
              (click)="onChangeNetwork()"
            >
              <span>Change network</span>
              <mat-icon class="mr-0">settings_ethernet</mat-icon>
            </button>
            <ng-container *ngIf="connected$ | async">
              <mat-divider></mat-divider>
              <button
                mat-menu-item
                (click)="onDisconnectWallet()"
                class="flex justify-between items-center"
              >
                <span class="font-bold text-warn">Disconnect</span>
                <mat-icon class="text-warn mr-0">logout</mat-icon>
              </button>
            </ng-container>
          </mat-menu>
        </mat-toolbar>
        <ng-content></ng-content>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .sidenav-container {
        height: 100%;
      }

      .sidenav {
        width: 200px;
      }

      .sidenav .mat-toolbar {
        background: inherit;
      }

      .mat-toolbar.mat-primary {
        position: sticky;
        top: 0;
        z-index: 1;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent {
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );
  connected$ = this.walletService.connected$;
  walletAddress$ = this.walletService.walletAddress$.pipe(
    isNotNull,
    obscureWalletAddress
  );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private matDialog: MatDialog,
    private walletService: SolanaDappWalletService,
    private connectWalletService: ConnectWalletService,
    private changeNetworkService: ChangeNetworkService,
    private viewWalletService: ViewWalletService
  ) {}

  onConnectWallet() {
    this.connectWalletService.open();
  }

  onDisconnectWallet() {
    if (confirm('Are you sure? This action will disconnect your wallet.')) {
      this.walletService.disconnect();
    }
  }

  onViewWallet() {
    this.viewWalletService.open();
  }

  onChangeNetwork() {
    this.changeNetworkService.open();
  }
}
