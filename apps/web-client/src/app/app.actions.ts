import { createAction, props } from '@ngrx/store';

export const init = createAction('[App] Init');
export const selectNetwork = createAction(
  '[App] Select Network',
  props<{ selectedId: string }>()
);
