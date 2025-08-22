import { ChannelEditOptions } from '../managers/channel-manager';
import { Query } from '../query';
import { ClientResolvable, RawChannel } from '../typings/types';
import Base from './base';

export default class Channel extends Base {
  parentId: number | null = null;
  name: string | null = null;
  order: number | null = null;
  topic: string | null = null;
  description: string | null = null;

  constructor(query: Query, data: Partial<RawChannel>) {
    super(query, Number(data.cid));

    this._patch(data);
  }

  _patch(data: Partial<RawChannel>) {
    if ('pid' in data) {
      this.parentId = Number(data.pid!);
      if (!this.query.channels.cache.has(this.parentId)) {
        this.query.channels._add({ cid: this.parentId });
      }
    }
    if ('channel_name' in data) {
      this.name = data.channel_name!;
    }
    if ('channel_order' in data) {
      this.order = Number(data.channel_order!);
    }
    if ('channel_topic' in data) {
      this.topic = data.channel_topic!;
    }
    if ('channel_description' in data) {
      this.description = data.channel_description!;
    }
  }

  get partial() {
    return typeof this.name !== 'string';
  }

  get parent(): Channel | null {
    return this.parentId ? this.query.channels.cache.get(this.parentId)! : null;
  }

  get children() {
    return this.query.channels.cache.filter((channel) => channel.parentId === this.id);
  }

  fetch(force = false) {
    return this.query.channels.fetch(this, { force });
  }

  sendMessage(content: string) {
    return this.query.channels.sendMessage(this, content);
  }

  kickClient(client: ClientResolvable, reason?: string) {
    return this.query.clients.kickFromChannel(client, reason);
  }

  edit(data: ChannelEditOptions) {
    return this.query.channels.edit(this, data);
  }

  delete(force = false) {
    return this.query.channels.delete(this, force);
  }
}
