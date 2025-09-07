import { Collection } from '@discordjs/collection';
import { Query } from '../query';
import { Channel } from '../structures/channel';
import { CachedManager } from './cached-manager';
import { BaseFetchOptions, ChannelResolvable } from '../typings/types';
import { stringifyValues } from '../utils/helpers';
import { Codec, RawChannel, RawChannelFindItem } from '../typings/teamspeak';
import { CommandError } from '../errors/command-error';

export type ChannelType = 'temporary' | 'semi-permanent' | 'permanent';

export type ChannelCreateOptions = ChannelEditOptions & {
  name: string;
};

export type ChannelEditOptions = {
  name?: string;
  topic?: string;
  description?: string;
  password?: string;
  codec?: Codec;
  codecQuality?: number;
  maxClients?: number;
  maxFamilyClients?: number;
  order?: number;
  type?: ChannelType;
  default?: true;
  maxClientsUnlimited?: boolean;
  maxFamilyClientsUnlimited?: boolean;
  maxFamilyClientsInherited?: boolean;
  neededTalkPower?: number;
  namePhonetic?: string;
};

/**
 * Manages the channels in the TeamSpeak server.
 */
export class ChannelManager extends CachedManager<Channel, RawChannel> {
  constructor(query: Query) {
    super(query, Channel, 'cid');
  }

  /**
   * Resolves a channel ID.
   * @param {ChannelResolvable} channel The object to resolve.
   * @returns {number} The channel ID.
   */
  resolveId(channel: ChannelResolvable): number {
    if (channel instanceof Channel) return channel.id;
    return channel;
  }

  /**
   * Obtains a channel from TeamSpeak, or the cache if it's available.
   * @param {ChannelResolvable} channel The channel to fetch.
   * @param {BaseFetchOptions} options The options for fetching the channel.
   * @returns {Promise<Channel>} The channel.
   */
  async fetch(
    channel: ChannelResolvable,
    options?: BaseFetchOptions,
  ): Promise<Awaited<ReturnType<ChannelManager['_fetchSingle']>>>;

  /**
   * Obtains all channels from TeamSpeak.
   * @returns {Promise<Collection<number, Channel>>} The channels.
   */
  async fetch(): Promise<Awaited<ReturnType<ChannelManager['_fetchAll']>>>;

  async fetch(
    channel?: ChannelResolvable,
    { cache = true, force = false }: BaseFetchOptions = {},
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
  } & BaseFetchOptions): Promise<Channel> {
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

  /**
   * Creates a new channel.
   * @param {ChannelCreateOptions} options The options for creating the channel.
   * @returns {Promise<Channel>} The created channel.
   */
  async create(options: ChannelCreateOptions): Promise<Channel> {
    const payload = {
      channel_name: options.name,
      channel_topic: options.topic,
      channel_description: options.description,
      channel_password: options.password,
      channel_flag_password: options.password !== undefined,
      channel_codec: options.codec,
      channel_codec_quality: options.codecQuality,
      channel_maxclients: options.maxClients,
      channel_maxfamilyclients: options.maxFamilyClients,
      channel_order: options.order,
      channel_flag_permanent: options.type === 'permanent' || undefined,
      channel_flag_semi_permanent: options.type === 'semi-permanent' || undefined,
      channel_flag_temporary: options.type === 'temporary' || undefined,
      channel_flag_default: options.default,
      channel_flag_maxclients_unlimited: options.maxClientsUnlimited,
      channel_flag_maxfamilyclients_unlimited: options.maxFamilyClientsUnlimited,
      channel_flag_maxfamilyclients_inherited: options.maxFamilyClientsInherited,
      channel_needed_talk_power: options.neededTalkPower,
      channel_name_phonetic: options.namePhonetic,
    };

    const { cid } = await this.query.commands.channelcreate(payload);

    return this.query.actions.ChannelCreate.handle(stringifyValues({ cid, ...payload })).channel;
  }

  //TODO: Find a cleaner approach for this payload stuff?

  /**
   * Edits a channel.
   * @param {ChannelResolvable} channel The channel to edit.
   * @param {ChannelEditOptions} data The new channel data.
   * @returns {Promise<Channel>} The updated channel.
   */
  async edit(channel: ChannelResolvable, data: ChannelEditOptions): Promise<Channel> {
    const id = this.resolveId(channel);

    const payload = {
      cid: id,
      channel_name: data.name,
      channel_topic: data.topic,
      channel_description: data.description,
      channel_password: data.password,
      channel_codec: data.codec,
      channel_codec_quality: data.codecQuality,
      channel_maxclients: data.maxClients,
      channel_maxfamilyclients: data.maxFamilyClients,
      channel_order: data.order,
      channel_flag_permanent: data.type && data.type === 'permanent',
      channel_flag_semi_permanent: data.type && data.type === 'semi-permanent',
      channel_flag_default: data.default,
      channel_flag_maxclients_unlimited: data.maxClientsUnlimited,
      channel_flag_maxfamilyclients_unlimited: data.maxFamilyClientsUnlimited,
      channel_flag_maxfamilyclients_inherited: data.maxFamilyClientsInherited,
      channel_needed_talk_power: data.neededTalkPower,
      channel_name_phonetic: data.namePhonetic,
    };

    await this.query.commands.channeledit(payload);

    return this.query.actions.ChannelUpdate.handle(stringifyValues(payload)).after!;
  }

  /**
   * Deletes a channel.
   * @param {ChannelResolvable} channel The channel to delete.
   * @param {boolean} [force=false] Whether to force the deletion. Forcing deletion will kick all clients from the channel.
   */
  async delete(channel: ChannelResolvable, force: boolean = false): Promise<void> {
    const id = this.resolveId(channel);
    await this.query.commands.channeldelete({ cid: id, force });
    this.query.actions.ChannelDelete.handle({ cid: id.toString() });
  }

  /**
   * Searches for channels based on the channel name.
   * @param {string} query The search query.
   * @returns {Promise<Collection<number, Channel>>} The found channels.
   */
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
}
