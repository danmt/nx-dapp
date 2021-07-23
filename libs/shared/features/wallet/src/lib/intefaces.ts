export interface Wallet {
  connect: () => Promise<void>;
  on: any;
  off: any;
}
