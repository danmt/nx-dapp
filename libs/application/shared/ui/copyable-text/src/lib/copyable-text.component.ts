import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';

@Component({
  selector: 'nx-dapp-copyable-text',
  template: `
    <p class="m-0 truncate flex-shrink">
      {{ text }}
    </p>

    <nx-dapp-copy-to-clipboard
      class="scale-75"
      [data]="text"
      tooltipLabel="Copied!"
    >
    </nx-dapp-copy-to-clipboard>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopyableTextComponent {
  @Input() text = '';
  @HostBinding('class') class =
    'block bg-black bg-opacity-25 rounded-md px-3 py-1 flex items-center mb-2';
}
