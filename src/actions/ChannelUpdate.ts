import { Query } from '../query';
import { Action } from '../structures/action';
import { Channel } from '../structures/channel';
import { Client } from '../structures/client';
import { Events } from '../utils/events';

type Payload = {
  cid: string;
  reasonid?: string;
  pid?: string;
  channel_name?: string;
  channel_codec_quality?: string;
  channel_order?: string;
  channel_codec_is_unencrypted?: string;
  channel_flag_maxfamilyclients_unlimited?: string;
  channel_flag_maxfamilyclients_inherited?: string;
  invokerid?: string;
  invokername?: string;
  invokeruid?: string;
};

export class ChannelUpdateAction extends Action {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): { before: Channel | null; after: Channel | null; invoker: Client } {
    const channel = this.query.channels.cache.get(Number(data.cid));
    const invoker = this.query.clients._add({
      clid: data.invokerid ? data.invokerid : this.query.client.id.toString(),
      client_nickname: data.invokername
        ? data.invokername
        : (this.query.client.nickname ?? undefined),
    });
    if (channel) {
      const before = channel._update(data);
      this.query.emit(Events.ChannelUpdate, before, channel, invoker);
      return { before, after: channel, invoker };
    } else {
      this.query.channels._add(data);
    }

    return { before: null, after: null, invoker };
  }
}
