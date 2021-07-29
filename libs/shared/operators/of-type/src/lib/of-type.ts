import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

interface Action {
  type: string;
}

export const ofType =
  <T extends Action>(actionType: string) =>
  (source: Observable<Action>) =>
    source.pipe(filter((action): action is T => action.type === actionType));
