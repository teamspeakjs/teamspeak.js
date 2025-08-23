import { Query } from '../query';
import Notification from '../structures/notification';
import { RawChannel } from '../typings/teamspeak';

// TODO: Fix those notification payloads. Can be done better. (Everywhere; Actions and Notifications)

type Payload = RawChannel & {
  invokerid: string;
  invokername: string;
  invokeruid: string;
};

export default class ChannelCreatedNotification extends Notification {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): void {
    this.query.actions.ChannelCreate.handle(data);
  }
}
