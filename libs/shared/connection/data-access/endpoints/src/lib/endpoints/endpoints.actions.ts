import { createAction, props } from '@ngrx/store';

export const init = createAction('[App] Init');
export const selectEndpoint = createAction(
  '[App] Select Endpoint',
  props<{ selectedId: string }>()
);
