import { Query } from '../query';
import Notification from '../structures/notification';

type Payload = {
  ctid: string;
  reasonid: string;
  invokerid?: string;
  invokername?: string;
  invokeruid?: string;
  clid: string;
};

export default class ClientMovedNotification extends Notification {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): void {
    this.query.actions.ClientMove.handle(data);
  }
}
