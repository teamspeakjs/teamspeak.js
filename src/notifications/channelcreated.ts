import { Query } from '../query';
import Notification from '../structures/notification';
import { RawChannel } from '../typings/types';

type Payload = RawChannel & {
  invokerid: string;
  invokername: string;
  invokeruid: string;
};

export default class ChannelCreatedNotification extends Notification {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload) {
    this.query.actions.ChannelCreate.handle(data);
  }
}
