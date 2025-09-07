import { Query } from '../query';
import { Action } from '../structures/action';
import { ChannelGroup } from '../structures/channel-group';
import { Events } from '../utils/events';

type Payload = {
  cgid: string;
};

export class ChannelGroupDeleteAction extends Action {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): { channelGroup: ChannelGroup | null } {
    const channelGroup = this.query.channelGroups.cache.get(Number(data.cgid));

    if (channelGroup) {
      this.query.channelGroups.cache.delete(channelGroup.id);
      this.query.emit(Events.ChannelGroupDelete, channelGroup);
      return { channelGroup };
    }

    return { channelGroup: null };
  }
}
