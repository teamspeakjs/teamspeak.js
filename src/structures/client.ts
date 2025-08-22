import { Query } from '../query';
import { RawClient } from '../typings/types';
import Base from './base';

export default class Client extends Base {
  channelId: number | null = null;
  databaseId: number | null = null;
  nickname: string | null = null;
  type: number | null = null;

  constructor(query: Query, data: RawClient) {
    super(query, Number(data.clid));

    this._patch(data);
  }

  _patch(data: RawClient) {
    if ('clid' in data) {
      this.id = Number(data.clid);
    }
    if ('cid' in data) {
      this.channelId = Number(data.cid);
      if (!this.query.channels.cache.has(this.channelId)) {
        this.query.channels._add({ cid: this.channelId });
      }
    }
    if ('client_database_id' in data) {
      this.databaseId = Number(data.client_database_id);
    }
    if ('client_nickname' in data) {
      this.nickname = data.client_nickname;
    }
    if ('client_type' in data) {
      this.type = Number(data.client_type);
    }
  }

  get partial() {
    return typeof this.nickname !== 'string';
  }

  get channel() {
    return this.channelId ? this.query.channels.cache.get(this.channelId)! : null;
  }

  kickFromChannel(reason?: string) {
    return this.query.clients.kickFromChannel(this, reason);
  }

  kickFromServer(reason?: string) {
    return this.query.clients.kickFromServer(this, reason);
  }

  sendMessage(content: string) {
    return this.query.clients.sendMessage(this, content);
  }

  //TODO: Turn into proper mention later
  toString() {
    return `Client ${this.id}: ${this.nickname}`;
  }
}
