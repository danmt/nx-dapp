import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  ENV as ChainID,
  TokenInfo,
  TokenListProvider,
} from '@solana/spl-token-registry';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { defer, from } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

import { Endpoint, ENV } from './types';

@Component({
  selector: 'nx-dapp-connections-dropdown',
  template: `
    <mat-form-field appearance="fill">
      <mat-label>Environment</mat-label>
      <mat-select [formControl]="endpointControl">
        <mat-option *ngFor="let endpoint of endpoints" [value]="endpoint.name">
          {{ endpoint.name }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectionsDropdownComponent implements OnInit {
  defaultEndpoint = 'mainnet-beta';
  endpointControl = new FormControl(this.defaultEndpoint);
  // Currently selected chain
  chain$ = this.endpointControl.valueChanges.pipe(
    startWith(this.defaultEndpoint),
    map(
      (endpointName: string) =>
        this.endpoints.find((endpoint) => endpoint.name === endpointName) ||
        this.endpoints[0]
    )
  );
  connections$ = this.chain$.pipe(
    map((chain) => ({
      connection: new Connection(chain.url, 'recent'),
      sendConnection: new Connection(chain.url, 'recent'),
    }))
  );
  connection$ = this.connections$.pipe(map(({ connection }) => connection));
  sendConnection$ = this.connections$.pipe(
    map(({ sendConnection }) => sendConnection)
  );
  tokensList$ = this.chain$.pipe(
    switchMap((chain) =>
      from(defer(() => new TokenListProvider().resolve())).pipe(
        map((res) =>
          res.filterByChainId(chain.chainID).excludeByTag('nft').getList()
        )
      )
    )
  );
  knownMints$ = this.tokensList$.pipe(
    map((tokensList) =>
      tokensList.reduce((map, item) => {
        map.set(item.address, item);
        return map;
      }, new Map<string, TokenInfo>())
    )
  );
  endpoints: Endpoint[] = [
    {
      name: 'mainnet-beta' as ENV,
      url: 'https://solana-api.projectserum.com/',
      chainID: ChainID.MainnetBeta,
    },
    {
      name: 'testnet' as ENV,
      url: clusterApiUrl('testnet'),
      chainID: ChainID.Testnet,
    },
    {
      name: 'devnet' as ENV,
      url: clusterApiUrl('devnet'),
      chainID: ChainID.Devnet,
    },
    {
      name: 'localnet' as ENV,
      url: 'http://127.0.0.1:8899',
      chainID: ChainID.Devnet,
    },
  ];

  ngOnInit() {
    this.tokensList$.subscribe((a) => console.log('tokensList$', a));
    this.knownMints$.subscribe((a) => console.log('knownMints$', a));
    this.connection$.subscribe((a) => console.log('connection$', a));
  }
}
