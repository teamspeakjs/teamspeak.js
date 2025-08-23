import { ClientEditOptions } from '../managers/client-manager';
import { Query } from '../query';
import { RawClient } from '../typings/teamspeak';
import { ChannelResolvable } from '../typings/types';
import Base from './base';
import Channel from './channel';

export default class Client extends Base {
  channelId: number | null = null;
  databaseId: number | null = null;
  uniqueId: string | null = null;
  nickname: string | null = null;
  type: number | null = null;
  description: string | null = null;

  constructor(query: Query, data: RawClient) {
    super(query, Number(data.clid));

    this._patch(data);
  }

  _patch(data: Partial<RawClient>): void {
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
    if ('client_description' in data) {
      this.description = data.client_description!;
    }
  }

  get partial(): boolean {
    return (
      typeof this.nickname !== 'string' ||
      typeof this.databaseId !== 'number' ||
      typeof this.description !== 'string'
    );
  }

  get channel(): Channel | null {
    return this.channelId ? this.query.channels.cache.get(this.channelId)! : null;
  }

  fetch(force = false): Promise<Client> {
    return this.query.clients.fetch(this, { force });
  }

  edit(data: ClientEditOptions): Promise<Client> {
    return this.query.clients.edit(this, data);
  }

  kickFromChannel(reason?: string): Promise<void> {
    return this.query.clients.kickFromChannel(this, reason);
  }

  kickFromServer(reason?: string): Promise<void> {
    return this.query.clients.kickFromServer(this, reason);
  }

  sendMessage(content: string): Promise<void> {
    return this.query.clients.sendMessage(this, content);
  }

  poke(content: string): Promise<void> {
    return this.query.clients.poke(this, content);
  }

  move(channel: ChannelResolvable, channelPassword?: string): Promise<Client> {
    return this.query.clients.move(this, channel, channelPassword);
  }

  toString(): string {
    return `[URL=client://${this.id}/${this.uniqueId}~${this.nickname}]${this.nickname}[/URL]`;
  }
}
