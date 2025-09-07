import { Query } from '../query';
import { Notification } from '../structures/notification';
import { RawClient } from '../typings/teamspeak';

type Payload = RawClient & {
  cfid: string;
  ctid: string;
  reasonid: string;
};

export class ClientEnterViewNotification extends Notification {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): void {
    this.query.actions.ClientEnterView.handle(data);
  }
}
