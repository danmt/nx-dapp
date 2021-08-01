export class WalletError extends Error {
  public error: unknown;

  constructor(message?: string, error?: unknown) {
    super(message);
    this.error = error;
  }
}

export class WalletWindowClosedError extends WalletError {
  name = 'WalletWindowClosedError';
}

export class WalletNotFoundError extends WalletError {
  name = 'WalletNotFoundError';
}

export class WalletNotInstalledError extends WalletError {
  name = 'WalletNotInstalledError';
}

export class WalletNotReadyError extends WalletError {
  name = 'WalletNotReadyError';
}

export class WalletNotSelectedError extends WalletError {
  name = 'WalletNotSelectedError';
}

export class WalletConnectionError extends WalletError {
  name = 'WalletConnectionError';
}

export class WalletAccountError extends WalletError {
  name = 'WalletAccountError';
}

export class WalletPublicKeyError extends WalletError {
  name = 'WalletPublicKeyError';
}

export class WalletKeypairError extends WalletError {
  name = 'WalletKeypairError';
}

export class WalletNotConnectedError extends WalletError {
  name = 'WalletNotConnectedError';
}

export class WalletSignatureError extends WalletError {
  name = 'WalletSignatureError';
}

export class WalletWindowBlockedError extends WalletError {
  name = 'WalletWindowBlockedError';
}
