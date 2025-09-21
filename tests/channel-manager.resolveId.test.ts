import { describe, it, expect } from 'vitest';

import { Query } from '../src';
import { Channel } from '../src/structures/channel';

describe('ChannelManager.resolveId', () => {
  const q = new Query({ host: 'localhost', port: 0 });

  it('resolves id from primitive', () => {
    expect(q.channels.resolveId(123)).toBe(123);
  });

  it('resolves id from Channel instance', () => {
    const ch = new Channel(q, { cid: '5' });
    expect(q.channels.resolveId(ch)).toBe(5);
  });

  // cleanup
  q.destroy();
});
