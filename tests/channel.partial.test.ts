import { describe, it, expect } from 'vitest';

import { Query } from '../src';
import { Channel } from '../src/structures/channel';

describe('Channel.partial', () => {
  it('true when key properties missing, false when present', () => {
    const q = new Query({ host: 'localhost', port: 0 });
    const ch = new Channel(q, { cid: '10', channel_name: 'x' });

    // missing description/topic/uniqueId
    expect(ch.partial).toBe(true);

    ch._patch({
      channel_description: 'desc',
      channel_topic: 'topic',
      channel_unique_identifier: 'uid',
    });

    expect(ch.partial).toBe(false);

    q.destroy();
  });
});
