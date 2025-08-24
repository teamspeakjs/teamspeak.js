import { Query } from '../query';
import Notification from '../structures/notification';
import TextMessage from '../structures/text-message';
import { RawTextMessage } from '../typings/teamspeak';
import { Events } from '../utils/events';

type Payload = RawTextMessage;

// TODO: This is not a temporary handler. Later, messages will have their own proper action and manager.

export default class TextMessageNotification extends Notification {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): void {
    const message = new TextMessage(this.query, data);
    this.query.emit(Events.TextMessage, message);
  }
}
