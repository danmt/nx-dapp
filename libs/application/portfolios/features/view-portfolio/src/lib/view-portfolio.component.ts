import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';

@Component({
  selector: 'nx-dapp-view-portfolio',
  template: `
    <header nxDappPageHeader>
      <h1>Portfolio</h1>
      <p>Monitor all your positions.</p>
    </header>
    <main>THE PORTFOLIO</main>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewPortfolioComponent {
  @HostBinding('class') class = 'block p-4';
}
