import { describe, it, expect } from 'vitest';

import { Events } from '../src/utils/events';

describe('Events constant', () => {
  it('contains expected top-level keys', () => {
    const keys = Object.keys(Events);
    expect(keys).toEqual(
      expect.arrayContaining([
        'Ready',
        'Error',
        'Close',
        'Debug',
        'ChannelCreate',
        'ChannelDelete',
        'ChannelUpdate',
        'ClientEnterView',
        'ClientLeaveView',
        'ClientUpdate',
        'ClientMove',
        'TextMessage',
        'ServerGroupCreate',
        'ServerGroupDelete',
        'ServerGroupUpdate',
        'BanCreate',
        'BanDelete',
        'ChannelGroupCreate',
        'ChannelGroupDelete',
        'ChannelGroupUpdate',
        'VirtualServerUpdate',
        'VirtualServerDelete',
      ]),
    );
  });
});
