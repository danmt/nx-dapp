import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { Position } from '@nx-dapp/application/portfolios/utils';

@Component({
  selector: 'nx-dapp-position-list-item',
  template: `
    <mat-card class="w-full h-full flex flex-col justify-around gap-2">
      <figure class="w-32 h-32 flex flex-col gap-2 mx-auto flex-shrink-0">
        <img [src]="position.logo" class="w-full h-full" />
      </figure>
      <h3 class="text-center m-0">
        {{ position.name }}
      </h3>
      <div>
        <p class="text-center m-0">Mint address</p>
        <div
          class="bg-black bg-opacity-25 rounded-md px-3 py-1 flex items-center mb-2"
        >
          <p class="m-0 truncate flex-shrink">
            {{ position.address }}
          </p>

          <nx-dapp-copy-to-clipboard
            class="scale-75"
            [data]="position.address"
            tooltipLabel="Copied!"
          >
          </nx-dapp-copy-to-clipboard>
        </div>

        <p class="text-center m-0">
          <span class="text-xl">{{ position.quantity | currency: '':'' }}</span>
          <span class="text-xs ml-1">{{ position.symbol }}</span>
        </p>
        <p class="text-center italic text-xs">
          ≈{{ position.total | currency }}
        </p>
        <button
          class="block mx-auto"
          mat-raised-button
          color="primary"
          (click)="onSendFunds()"
        >
          Send funds
        </button>
      </div>
    </mat-card>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PositionListItemComponent {
  @HostBinding('class') class = 'block w-full h-full';
  @Input() position!: Position;
  @Output() sendFunds = new EventEmitter();

  onSendFunds() {
    this.sendFunds.emit();
  }
}
