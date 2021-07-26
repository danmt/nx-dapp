import { Injectable } from '@angular/core';
import { Connection } from '@solana/web3.js';

export type CONNECTION_TYPE = 'main' | 'send';

@Injectable({
  providedIn: 'root',
})
export class ConnectionsService {
  connection: Connection | null = null;
  sendConnection: Connection | null = null;

  setConnection(endpoint: string) {
    this.connection = new Connection(endpoint, 'recent');
  }

  setSendConnection(endpoint: string) {
    this.sendConnection = new Connection(endpoint, 'recent');
  }
}
