import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'nx-dapp-transactions-in-process-trigger',
  template: `
    <button
      class="mx-auto block"
      mat-raised-button
      color="primary"
      (click)="onOpenSheet()"
    >
      <span class="flex justify-center gap-2 items-center">
        Transactions in Process ({{ inProcess }})
        <mat-spinner color="accent" diameter="24"></mat-spinner>
      </span>
    </button>
  `,
})
export class TransactionsInProcessTriggerComponent {
  @HostBinding('class') class = 'block fixed bottom-0 left-0 w-screen z-10';
  @Input() inProcess: number | null = null;
  @Output() openSheet = new EventEmitter();

  onOpenSheet() {
    this.openSheet.emit();
  }
}
