import { Query } from '../query';
import Action from '../structures/action';
import Channel from '../structures/channel';
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

  handle(data: Payload): Channel {
    const existing = this.query.channels.cache.get(Number(data.cid));
    const channel = this.query.channels._add(data);
    if (!existing && channel) {
      this.query.emit(Events.ChannelCreate, channel);
    }

    return channel;
  }
}
