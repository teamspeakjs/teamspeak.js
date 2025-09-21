import { describe, it, expect } from 'vitest';

import { stringifyValues } from '../src/utils/helpers';

describe('stringifyValues', () => {
  it('stringifies primitive values and preserves keys', () => {
    const input = {
      a: 1,
      b: true,
      c: 'x',
      d: null as null | string,
      e: undefined as undefined | number,
    };
    const result = stringifyValues(input);

    expect(result).toEqual({ a: '1', b: 'true', c: 'x', d: '', e: '' });
  });
});
