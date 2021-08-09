import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'nx-dapp-shell',
  template: `
    <nx-dapp-navigation>
      <router-outlet></router-outlet>
    </nx-dapp-navigation>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {}
