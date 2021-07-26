import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Wallet } from './interfaces';

@Component({
  selector: 'nx-dapp-wallet-option',
  template: `
    <button mat-menu-item class="flex items-center" (click)="connect()">
      <img class="inline-block w-6 h-6 mr-2" [src]="icon" />
      {{ label }}
    </button>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletOptionComponent implements OnInit, OnDestroy {
  private _destroy = new Subject();
  @Input() label!: string;
  @Input() icon!: string;
  @Input() url!: string;
  @Input() adapter!: Wallet;
  @Output() connected = new EventEmitter<Wallet>();

  ngOnInit() {
    fromEvent(this.adapter, 'connect')
      .pipe(takeUntil(this._destroy))
      .subscribe(() => this.connected.emit(this.adapter));
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }

  connect() {
    this.adapter.connect();
  }
}
