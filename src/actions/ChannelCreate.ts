import { Query } from '../query';
import Action from '../structures/action';
import Channel from '../structures/channel';
import Client from '../structures/client';
import { Events } from '../utils/events';

type Payload = {
  cid: string;
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

export default class ChannelCreateAction extends Action {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): { channel: Channel; invoker: Client } {
    const existing = this.query.channels.cache.get(Number(data.cid));
    const channel = this.query.channels._add(data);
    const invoker = this.query.clients._add({
      clid: data.invokerid ? data.invokerid : this.query.client.id.toString(),
      client_nickname: data.invokername
        ? data.invokername
        : (this.query.client.nickname ?? undefined),
    });
    if (!existing && channel) {
      this.query.emit(Events.ChannelCreate, channel, invoker);
    }

    return {
      channel,
      invoker,
    };
  }
}
