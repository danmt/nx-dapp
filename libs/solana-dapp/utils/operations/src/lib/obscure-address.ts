export const obscureAddress = (value: string) =>
  value
    .split('')
    .reduce(
      (state: string, curr: string, index: number) =>
        state + (index <= 3 || index >= 39 ? curr : '*')
    )
    .split('*')
    .filter((segment) => segment)
    .join('***');
