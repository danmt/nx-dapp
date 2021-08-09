import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'nx-dapp-portfolios-shell',
  template: ` <router-outlet></router-outlet> `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfoliosShellComponent {}
