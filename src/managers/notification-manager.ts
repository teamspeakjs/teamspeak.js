import { ChannelCreatedNotification } from '../notifications/channelcreated';
import { ChannelDeletedNotification } from '../notifications/channeldeleted';
import { ChannelEditedNotification } from '../notifications/channeledited';
import { ClientEnterViewNotification } from '../notifications/cliententerview';
import { ClientLeftViewNotification } from '../notifications/clientleftview';
import { ClientMovedNotification } from '../notifications/clientmoved';
import { TextMessageNotification } from '../notifications/textmessage';
import { Query } from '../query';
import { BaseManager } from './base-manager';

export class NotificationManager extends BaseManager {
  // CHANNELS
  channelcreated: ChannelCreatedNotification;
  channeldeleted: ChannelDeletedNotification;
  channeledited: ChannelEditedNotification;

  // CLIENTS
  cliententerview: ClientEnterViewNotification;
  clientleftview: ClientLeftViewNotification;
  clientmoved: ClientMovedNotification;

  // TEXT MESSAGES
  textmessage: TextMessageNotification;

  constructor(query: Query) {
    super(query);

    this.channelcreated = new ChannelCreatedNotification(this.query);
    this.channeldeleted = new ChannelDeletedNotification(this.query);
    this.channeledited = new ChannelEditedNotification(this.query);

    this.cliententerview = new ClientEnterViewNotification(this.query);
    this.clientleftview = new ClientLeftViewNotification(this.query);
    this.clientmoved = new ClientMovedNotification(this.query);

    this.textmessage = new TextMessageNotification(this.query);
  }

  /**
   * Subscribe to all notifications.
   */
  async subscribeAll(): Promise<void> {
    await this.subscribeServer();
    await this.subscribeChannel();
    await this.subscribeTextServer();
    await this.subscribeTextChannel();
    await this.subscribeTextPrivate();
  }

  /**
   * Subscribe to server notifications.
   */
  subscribeServer(): Promise<void> {
    return this.query.commands.servernotifyregister({ event: 'server' });
  }

  /**
   * Subscribe to channel notifications.
   */
  subscribeChannel(channelId: number = 0): Promise<void> {
    return this.query.commands.servernotifyregister({ event: 'channel', id: channelId });
  }

  /**
   * Subscribe to text server notifications.
   */
  subscribeTextServer(): Promise<void> {
    return this.query.commands.servernotifyregister({ event: 'textserver' });
  }

  /**
   * Subscribe to text channel notifications.
   */
  subscribeTextChannel(): Promise<void> {
    return this.query.commands.servernotifyregister({ event: 'textchannel' });
  }

  /**
   * Subscribe to text private notifications.
   */
  subscribeTextPrivate(): Promise<void> {
    return this.query.commands.servernotifyregister({ event: 'textprivate' });
  }

  /**
   * Unsubscribe from all notifications.
   */
  unsubscribeAll(): Promise<void> {
    return this.query.commands.servernotifyunregister();
  }
}
