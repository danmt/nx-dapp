import { Component } from '@angular/core';

@Component({
  selector: 'nx-dapp-root',
  template: `
    <header>
      <nx-dapp-wallets-dropdown></nx-dapp-wallets-dropdown>
      <nx-dapp-connections-dropdown></nx-dapp-connections-dropdown>
    </header>
    <h1>First Dapp</h1>
  `,
  styles: [``],
})
export class AppComponent {}
