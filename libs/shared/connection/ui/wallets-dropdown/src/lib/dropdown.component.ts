import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { DEFAULT_WALLET, Wallet } from '@nx-dapp/solana-dapp/wallet/base';

@Component({
  selector: 'nx-dapp-wallets-dropdown',
  template: `
    <mat-form-field appearance="fill">
      <mat-label>Wallet</mat-label>
      <mat-select [formControl]="walletControl">
        <mat-option *ngFor="let wallet of wallets" [value]="wallet.name">
          {{ wallet.name }}
        </mat-option>
      </mat-select>
    </mat-form-field>
    <button
      *ngIf="!isConnected"
      mat-raised-button
      color="primary"
      (click)="onConnectWallet()"
      type="button"
    >
      Connect
    </button>
    <button
      *ngIf="isConnected"
      mat-raised-button
      color="primary"
      (click)="onDisconnectWallet()"
      type="button"
    >
      Disconnect
    </button>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletsDropdownComponent {
  @Input() wallet: Wallet | null = null;
  @Input() wallets: Wallet[] | null = null;
  @Input() isConnected: boolean | null = null;
  walletControl = new FormControl(
    this.wallet ? this.wallet.name : DEFAULT_WALLET
  );
  @Output() changeWallet = this.walletControl.valueChanges;
  @Output() connectWallet = new EventEmitter();
  @Output() disconnectWallet = new EventEmitter();

  onConnectWallet() {
    this.connectWallet.emit();
  }

  onDisconnectWallet() {
    this.disconnectWallet.emit();
  }
}
