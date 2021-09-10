import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { DarkThemeService } from '@nx-dapp/application/shared/ui/dark-theme';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'nx-dapp-navigation',
  template: `
    <mat-sidenav-container class="sidenav-container" fullscreen>
      <mat-sidenav
        #drawer
        class="sidenav"
        fixedInViewport
        [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
        [mode]="(isHandset$ | async) ? 'over' : 'side'"
        [opened]="(isHandset$ | async) === false"
      >
        <figure class="mt-4 w-full flex justify-center">
          <img src="assets/images/logo.png" class="w-4/6"/>
        </figure>
        <h2 class="mt-4 text-center">DEMOBASE</h2>
        <mat-nav-list>
          <a mat-list-item routerLink="/portfolios/view-portfolio">Portfolio</a>
          <div class="mt-8 px-4" *ngIf="isConnected">
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

          <div
            class="absolute bottom-5 w-full flex justify-center items-center"
          >
            <mat-icon class="mr-1">bedtime</mat-icon>
            <mat-slide-toggle
              class="mr-1"
              (change)="toggleDarkMode(!$event.checked)"
              [nxDappDarkTheme]="isDarkThemeEnabled$ | async"
              [checked]="(isDarkThemeEnabled$ | async) === false"
            >
            </mat-slide-toggle>
            <mat-icon>brightness_5</mat-icon>
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

          <div *ngIf="!isConnected" class="ml-auto">
            <button
              mat-raised-button
              color="accent"
              (click)="onConnectWallet()"
            >
              Connect
            </button>
          </div>

          <div *ngIf="isConnected" class="ml-auto flex items-center">
            {{ walletAddress | obscureAddress }}
          </div>
          <ng-content></ng-content>
        </mat-toolbar>
        <router-outlet></router-outlet>
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
  @Input() isConnected: boolean | null = null;
  @Input() walletAddress: string | null = null;
  @Output() connectWallet = new EventEmitter();
  @Output() disconnectWallet = new EventEmitter();
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );
  isDarkThemeEnabled$ = this.themeService.isDarkThemeEnabled$;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private themeService: DarkThemeService
  ) {}

  onConnectWallet() {
    this.connectWallet.emit();
  }

  onDisconnectWallet() {
    this.disconnectWallet.emit();
  }

  toggleDarkMode(isDarkThemeEnabled: boolean) {
    this.themeService.setDarkTheme(isDarkThemeEnabled);
  }
}
