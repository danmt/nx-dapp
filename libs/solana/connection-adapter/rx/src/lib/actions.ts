export class InitAction {
  type = 'init';
}

export class SelectEndpointAction {
  type = 'selectEndpoint';

  constructor(public payload: string) {}
}
