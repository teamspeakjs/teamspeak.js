import { Query } from '../query';
import Action from '../structures/action';
import ChannelGroup from '../structures/channel-group';
import { Events } from '../utils/events';

type Payload = {
  cgid: string;
  name: string;
};

export default class ChannelGroupUpdateAction extends Action {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): { before: ChannelGroup | null; after: ChannelGroup | null } {
    const channelGroup = this.query.channelGroups.cache.get(Number(data.cgid));
    if (channelGroup) {
      const before = channelGroup._update(data);
      this.query.emit(Events.ChannelGroupUpdate, before, channelGroup);
      return { before, after: channelGroup };
    } else {
      this.query.channelGroups._add(data);
    }

    return { before: null, after: null };
  }
}
