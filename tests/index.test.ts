import { describe, it, expect } from 'vitest';

import * as lib from '../src';

describe('library exports', () => {
  it('exports Query from index', () => {
    expect(typeof lib.Query).toBe('function');
  });
});
