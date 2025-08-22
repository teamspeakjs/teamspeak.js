import { Query } from '../query';
import Action from '../structures/action';
import Channel from '../structures/channel';
import { Events } from '../utils/events';

type Payload = {
  cid: string;
  invokerid?: string;
  invokername?: string;
  invokeruid?: string;
};

export default class ChannelDeleteAction extends Action {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): Channel | null {
    const channel = this.query.channels.cache.get(Number(data.cid));
    if (channel) {
      this.query.channels.cache.delete(channel.id);
      this.query.emit(Events.ChannelDelete, channel);
      return channel;
    }
    return null;
  }
}
