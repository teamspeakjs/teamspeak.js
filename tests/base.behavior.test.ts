import { describe, it, expect } from 'vitest';

import { Base } from '../src/structures/base';
import { Query } from '../src';

class Dummy extends Base {
  value: number | null = null;
  constructor(query: Query, id: number, value?: number) {
    super(query, id);
    if (value !== undefined) this.value = value;
  }
  _patch(data: Partial<{ value: number }>): void {
    if ('value' in data && data.value !== undefined) this.value = data.value;
  }
}

describe('Base subclass behavior', () => {
  const q = new Query({ host: 'localhost', port: 0 });

  it('clone returns a shallow copy preserving properties', () => {
    const d = new Dummy(q, 1, 10);
    const clone = d._clone();
    expect(clone).not.toBe(d);
    expect(clone.id).toBe(1);
    expect((clone as Dummy).value).toBe(10);
  });

  it('update returns previous state and applies patch to instance', () => {
    const d = new Dummy(q, 1, 10);
    const before = d._update({ value: 20 });
    expect((before as Dummy).value).toBe(10);
    expect(d.value).toBe(20);
  });

  it('valueOf returns id', () => {
    const d = new Dummy(q, 42, 3);
    expect(d.valueOf()).toBe(42);
  });

  // cleanup
  q.destroy();
});
