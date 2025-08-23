import { Query } from '../query';
import Action from '../structures/action';
import Channel from '../structures/channel';
import Client from '../structures/client';
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

  handle(data: Payload): { channel: Channel | null; invoker: Client } {
    const channel = this.query.channels.cache.get(Number(data.cid));
    const invoker = this.query.clients._add({
      clid: data.invokerid ? data.invokerid : this.query.client.id.toString(),
      client_nickname: data.invokername
        ? data.invokername
        : (this.query.client.nickname ?? undefined),
    });
    if (channel) {
      this.query.channels.cache.delete(channel.id);
      this.query.emit(Events.ChannelDelete, channel, invoker);
      return { channel, invoker };
    }
    return { channel: null, invoker };
  }
}
