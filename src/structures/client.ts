import { Query } from '../query';
import { RawClient } from '../typings/teamspeak';
import Base from './base';

export default class Client extends Base {
  channelId: number | null = null;
  databaseId: number | null = null;
  uniqueId: string | null = null;
  nickname: string | null = null;
  type: number | null = null;

  constructor(query: Query, data: RawClient) {
    super(query, Number(data.clid));

    this._patch(data);
  }

  _patch(data: Partial<RawClient>) {
    if ('clid' in data) {
      this.id = Number(data.clid!);
    }
    if ('cid' in data) {
      this.channelId = Number(data.cid!);
      if (!this.query.channels.cache.has(this.channelId)) {
        this.query.channels._add({ cid: this.channelId.toString() });
      }
    }
    if ('client_unique_identifier' in data) {
      this.uniqueId = data.client_unique_identifier!;
    }
    if ('client_database_id' in data) {
      this.databaseId = Number(data.client_database_id!);
    }
    if ('client_nickname' in data) {
      this.nickname = data.client_nickname!;
    }
    if ('client_type' in data) {
      this.type = Number(data.client_type!);
    }
  }

  get partial() {
    return typeof this.nickname !== 'string' || typeof this.databaseId !== 'number';
  }

  get channel() {
    return this.channelId ? this.query.channels.cache.get(this.channelId)! : null;
  }

  fetch(force = false) {
    return this.query.clients.fetch(this, { force });
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

  toString() {
    return `[URL=client://${this.id}/${this.uniqueId}~${this.nickname}]${this.nickname}[/URL]`;
  }
}
