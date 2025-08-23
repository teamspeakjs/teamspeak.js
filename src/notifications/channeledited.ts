import { Query } from '../query';
import Notification from '../structures/notification';

type Payload = {
  cid: string;
  pid: string;
  channel_name: string;
  channel_codec_quality: string;
  channel_order: string;
  channel_codec_is_unencrypted: string;
  channel_flag_maxfamilyclients_unlimited: string;
  channel_flag_maxfamilyclients_inherited: string;
  invokerid: string;
  invokername: string;
  invokeruid: string;
};

export default class ChannelEditedNotification extends Notification {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): void {
    this.query.actions.ChannelUpdate.handle(data);
  }
}
