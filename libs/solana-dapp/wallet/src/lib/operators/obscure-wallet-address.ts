import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ObscureConfig {
  skipUntil: number;
  takeUntil: number;
  placeholder: string;
}

const SKIP_UNTIL = 3;
const TAKE_UNTIL = 39;
const PLACEHOLDER = '*';

const createReducer =
  (config: ObscureConfig) => (state: string, curr: string, index: number) =>
    state +
    (index <= config.skipUntil || index >= config.takeUntil
      ? curr
      : config.placeholder);

export const obscureWith = (
  reducerFunction: (
    previousValue: string,
    currentValue: string,
    currentIndex: number,
    array: string[]
  ) => string
) => {
  return (source: Observable<string>) =>
    source.pipe(map((value) => value.split('').reduce(reducerFunction)));
};

export const obscureWalletAddress = (source: Observable<string>) =>
  source.pipe(
    obscureWith(
      createReducer({
        skipUntil: SKIP_UNTIL,
        takeUntil: TAKE_UNTIL,
        placeholder: PLACEHOLDER,
      })
    ),
    map((obscured) =>
      obscured
        .split('*')
        .filter((segment) => segment)
        .join('***')
    )
  );
