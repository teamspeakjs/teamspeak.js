import { Query } from '../query';
import { Notification } from '../structures/notification';

type Payload = {
  cid: string;
  invokerid: string;
  invokername: string;
  invokeruid: string;
};

export class ChannelDeletedNotification extends Notification {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): void {
    this.query.actions.ChannelDelete.handle(data);
  }
}
