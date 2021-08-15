import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'nx-dapp-copy-to-clipboard',
  template: `
    <button
      mat-mini-fab
      color="primary"
      #tooltip="matTooltip"
      [matTooltip]="tooltipLabel"
      matTooltipPosition="above"
      [cdkCopyToClipboard]="data"
      [matTooltipDisabled]="(copied$ | async) === false"
      (click)="onCopy(tooltip)"
    >
      <mat-icon>content_copy</mat-icon>
    </button>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopyToClipboardComponent {
  @Input() data = '';
  @Input() tooltipLabel = '';
  private readonly _copied = new BehaviorSubject(false);
  copied$ = this._copied.asObservable();

  onCopy(tooltip: MatTooltip) {
    this._copied.next(true);

    setTimeout(() => tooltip.show());
    setTimeout(() => {
      tooltip.hide();
      this._copied.next(false);
    }, 2000);
  }
}
