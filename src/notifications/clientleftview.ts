import { Query } from '../query';
import Notification from '../structures/notification';

type Payload = {
  cfid: string;
  ctid: string;
  reasonid: string;
  reasonmsg: string;
  clid: string;
};

export default class ClientLeftViewNotification extends Notification {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): void {
    this.query.actions.ClientLeaveView.handle(data);
  }
}
