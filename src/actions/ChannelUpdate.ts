import { Query } from '../query';
import Action from '../structures/action';
import Channel from '../structures/channel';
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

export default class ChannelUpdateAction extends Action {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): { before: Channel | null; after: Channel | null } {
    const channel = this.query.channels.cache.get(Number(data.cid));
    if (channel) {
      const before = channel._update(data);
      this.query.emit(Events.ChannelUpdate, before, channel);
      return { before, after: channel };
    } else {
      this.query.channels._add(data);
    }

    return { before: null, after: null };
  }
}
