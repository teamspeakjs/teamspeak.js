import { describe, it, expect } from 'vitest';

import { Query } from '../src';
import { Channel } from '../src/structures/channel';

describe('Query.destroy', () => {
  it('clears caches and removes listeners', () => {
    const q = new Query({ host: 'localhost', port: 0 });

    // populate caches with minimal entries
    const ch = new Channel(q, { cid: '1' });
    q.channels.cache.set(1, ch);

    expect(q.channels.cache.size).toBe(1);

    // sanity: add a listener
    const handler: () => void = () => {};
    q.on('Debug', handler);
    expect(q.listenerCount('Debug')).toBe(1);

    q.destroy();

    expect(q.channels.cache.size).toBe(0);
    expect(q.listenerCount('Debug')).toBe(0);
  });
});
