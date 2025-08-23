import { Collection } from '@discordjs/collection';
import { Query } from '../query';
import Channel from '../structures/channel';
import CachedManager from './cached-manager';
import { ChannelResolvable } from '../typings/types';
import { stringifyValues } from '../utils/helpers';
import { RawChannel, RawChannelFindItem } from '../typings/teamspeak';
import CommandError from '../errors/command-error';

type ChannelCreateOptions = {
  name: string;
  topic?: string;
  description?: string;
  type?: 'temporary' | 'permanent';
  default?: boolean;
};

export type ChannelEditOptions = {
  name?: string;
  topic?: string;
  description?: string;
};

export default class ChannelManager extends CachedManager<Channel, RawChannel> {
  constructor(query: Query) {
    super(query, Channel, 'cid');
  }

  resolveId(channel: ChannelResolvable): number {
    if (channel instanceof Channel) return channel.id;
    return channel;
  }

  async fetch(
    channel: ChannelResolvable,
    options?: { cache?: boolean; force?: boolean },
  ): Promise<Awaited<ReturnType<ChannelManager['_fetchSingle']>>>;
  async fetch(): Promise<Awaited<ReturnType<ChannelManager['_fetchAll']>>>;

  async fetch(
    channel?: ChannelResolvable,
    { cache = true, force = false } = {},
  ): Promise<Awaited<ReturnType<typeof this._fetchSingle | typeof this._fetchAll>>> {
    if (channel) {
      return this._fetchSingle({ channel, cache, force });
    } else {
      return this._fetchAll();
    }
  }

  protected async _fetchSingle({
    channel,
    cache,
    force = false,
  }: {
    channel: ChannelResolvable;
    cache?: boolean;
    force?: boolean;
  }): Promise<Channel> {
    const id = this.resolveId(channel);

    if (!force) {
      const existing = this.cache.get(id);
      if (existing && !existing.partial) return existing;
    }

    const data = await this.query.commands.channelinfo({ cid: id });

    return this._add(
      {
        ...data,
        cid: id.toString(),
      },
      cache,
    );
  }

  protected async _fetchAll(): Promise<Collection<number, Channel>> {
    const data = await this.query.commands.channellist();

    const channels = new Collection<number, Channel>();

    for (const channel of data) {
      channels.set(Number(channel.cid), this._add(channel));
    }

    return channels;
  }

  async search(query: string): Promise<Collection<number, Channel>> {
    let _data: RawChannelFindItem | RawChannelFindItem[] = [];
    try {
      _data = await this.query.commands.channelfind({ pattern: query });
    } catch (error) {
      if (error instanceof CommandError && error.id === 768) {
        return new Collection<number, Channel>();
      }

      throw error;
    }

    const data = Array.isArray(_data) ? _data : [_data];

    const channels = new Collection<number, Channel>();

    for (const channel of data) {
      channels.set(Number(channel.cid), this._add(channel));
    }

    return channels;
  }

  async create(options: ChannelCreateOptions): Promise<Channel> {
    const data = await this.query.commands.channelcreate({
      channel_name: options.name,
      channel_topic: options.topic,
      channel_description: options.description,
      channel_flag_temporary: options.type === 'temporary',
      channel_flag_permanent: options.type === 'permanent',
      channel_flag_default: options.default,
    });

    return this.query.actions.ChannelCreate.handle(data).channel;
  }

  async delete(channel: ChannelResolvable, force = false): Promise<void> {
    const id = this.resolveId(channel);
    await this.query.commands.channeldelete({ cid: id, force });
    this.query.actions.ChannelDelete.handle({ cid: id.toString() });
  }

  //TODO: Find a cleaner approach for this?
  async edit(channel: ChannelResolvable, data: ChannelEditOptions): Promise<Channel> {
    const id = this.resolveId(channel);

    const payload: Parameters<typeof this.query.commands.channeledit>[0] = {
      cid: id,
      channel_name: data.name,
      channel_topic: data.topic,
      channel_description: data.description,
    };

    await this.query.commands.channeledit(payload);

    return this.query.actions.ChannelUpdate.handle(stringifyValues(payload)).after!;
  }
}
