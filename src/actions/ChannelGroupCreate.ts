import { Query } from '../query';
import Action from '../structures/action';
import ChannelGroup from '../structures/channel-group';
import { Events } from '../utils/events';

type Payload = {
  cgid: string;
  name: string;
};

export default class ChannelGroupCreateAction extends Action {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): { channelGroup: ChannelGroup } {
    const existing = this.query.channelGroups.cache.get(Number(data.cgid));
    const channelGroup = this.query.channelGroups._add(data);
    if (!existing && channelGroup) {
      this.query.emit(Events.ChannelGroupCreate, channelGroup);
    }

    return {
      channelGroup,
    };
  }
}
