import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'nx-dapp-settings-menu',
  template: `
    <button mat-mini-fab color="accent" [matMenuTriggerFor]="menu" class="ml-4">
      <mat-icon>settings</mat-icon>
    </button>

    <mat-menu #menu="matMenu" class="w-52">
      <button *ngIf="isConnected" mat-menu-item (click)="onViewWallet()">
        Wallet
      </button>
      <button *ngIf="isConnected" mat-menu-item (click)="onViewTransactions()">
        Transactions
      </button>
      <button
        mat-menu-item
        class="flex justify-between items-center"
        (click)="onChangeNetwork()"
      >
        <span>Change network</span>
        <mat-icon class="mr-0">settings_ethernet</mat-icon>
      </button>
      <ng-container *ngIf="isConnected">
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
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsMenuComponent {
  @Input() isConnected: boolean | null = null;
  @Output() changeNetwork = new EventEmitter();
  @Output() viewWallet = new EventEmitter();
  @Output() viewTransactions = new EventEmitter();
  @Output() disconnectWallet = new EventEmitter();

  onChangeNetwork() {
    this.changeNetwork.emit();
  }

  onViewWallet() {
    this.viewWallet.emit();
  }

  onViewTransactions() {
    this.viewTransactions.emit();
  }

  onDisconnectWallet() {
    this.disconnectWallet.emit();
  }
}
