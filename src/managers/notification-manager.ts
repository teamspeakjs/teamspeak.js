import ChannelCreatedNotification from '../notifications/channelcreated';
import ChannelDeletedNotification from '../notifications/channeldeleted';
import ChannelEditedNotification from '../notifications/channeledited';
import { Query } from '../query';
import BaseManager from './base-manager';

export default class NotificationManager extends BaseManager {
  channelcreated: ChannelCreatedNotification;
  channeldeleted: ChannelDeletedNotification;
  channeledited: ChannelEditedNotification;

  constructor(query: Query) {
    super(query);
    this.channelcreated = new ChannelCreatedNotification(this.query);
    this.channeldeleted = new ChannelDeletedNotification(this.query);
    this.channeledited = new ChannelEditedNotification(this.query);
  }

  async subscribeAll(): Promise<void> {
    await this.query.commands._execute('servernotifyregister', { event: 'server' });
    await this.query.commands._execute('servernotifyregister', { event: 'channel', id: 0 });
    await this.query.commands._execute('servernotifyregister', { event: 'textserver' });
    await this.query.commands._execute('servernotifyregister', { event: 'textchannel' });
    await this.query.commands._execute('servernotifyregister', { event: 'textprivate' });
  }
}
