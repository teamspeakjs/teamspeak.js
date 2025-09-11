import { Collection } from '@discordjs/collection';
import { ChannelEditOptions, ChannelMoveOptions, ChannelType } from '../managers/channel-manager';
import { Query } from '../query';
import { Codec, RawChannel } from '../typings/teamspeak';
import { ClientResolvable } from '../typings/types';
import { Base } from './base';

/**
 * Represents a channel.
 */
export class Channel extends Base {
  parentId: number | null = null;
  name: string | null = null;
  topic: string | null = null;
  description: string | null = null;
  password: string | null = null;
  codec: Codec | null = null;
  codecQuality: number | null = null;
  maxClients: number | null = null;
  maxFamilyClients: number | null = null;
  order: number | null = null;
  type: ChannelType | null = null;
  default: boolean | null = null;
  latencyFactor: number | null = null;
  codecUnencrypted: boolean | null = null;
  securitySalt: string | null = null;
  deleteDelay: number | null = null;
  uniqueId: string | null = null;
  maxClientsUnlimited: boolean | null = null;
  maxFamilyClientsUnlimited: boolean | null = null;
  maxFamilyClientsInherited: boolean | null = null;
  filepath: string | null = null;
  neededTalkPower: number | null = null;
  forcedSilence: boolean | null = null;
  namePhonetic: string | null = null;
  iconId: number | null = null;
  bannerGfxUrl: string | null = null;
  bannerMode: number | null = null;
  secondsEmpty: number | null = null;

  constructor(query: Query, data: Partial<RawChannel>) {
    super(query, Number(data.cid));

    this._patch(data);
  }

  /**
   * Patches the channel with new data.
   * @param {Partial<RawChannel>} data The new data to patch the channel with.
   */
  _patch(data: Partial<RawChannel>): void {
    if ('pid' in data) {
      this.parentId = Number(data.pid!);
      // Check if parentId != 0 aswell since parentId is sent as 0 and otherwise the cache would write an empty channel
      if (this.parentId != 0 && !this.query.channels.cache.has(this.parentId)) {
        this.query.channels._add({ cid: this.parentId.toString() });
      }
    }
    if ('channel_name' in data) {
      this.name = data.channel_name!;
    }
    if ('channel_topic' in data) {
      this.topic = data.channel_topic!;
    }
    if ('channel_description' in data) {
      this.description = data.channel_description!;
    }
    if ('channel_password' in data) {
      this.password = data.channel_password!;
    }
    if ('channel_codec' in data) {
      this.codec = Number(data.channel_codec!);
    }
    if ('channel_codec_quality' in data) {
      this.codecQuality = Number(data.channel_codec_quality!);
    }
    if ('channel_maxclients' in data) {
      this.maxClients = Number(data.channel_maxclients!);
    }
    if ('channel_maxfamilyclients' in data) {
      this.maxFamilyClients = Number(data.channel_maxfamilyclients!);
    }
    if ('channel_order' in data) {
      this.order = Number(data.channel_order!);
    }
    if ('channel_flag_permanent' in data) {
      if (data.channel_flag_permanent === '1') this.type = 'permanent';
    }
    if ('channel_flag_semi_permanent' in data) {
      if (data.channel_flag_semi_permanent === '1') this.type = 'semi-permanent';
    }
    if (this.type === null) {
      this.type = 'temporary';
    }
    if ('channel_flag_default' in data) {
      this.default = data.channel_flag_default === '1';
    }
    if ('channel_codec_latency_factor' in data) {
      this.latencyFactor = Number(data.channel_codec_latency_factor!);
    }
    if ('channel_codec_is_unencrypted' in data) {
      this.codecUnencrypted = data.channel_codec_is_unencrypted === '1';
    }
    if ('channel_security_salt' in data) {
      this.securitySalt = data.channel_security_salt!;
    }
    if ('channel_delete_delay' in data) {
      this.deleteDelay = Number(data.channel_delete_delay!);
    }
    if ('channel_unique_identifier' in data) {
      this.uniqueId = data.channel_unique_identifier!;
    }
    if ('channel_flag_maxclients_unlimited' in data) {
      this.maxClientsUnlimited = data.channel_flag_maxclients_unlimited === '1';
    }
    if ('channel_flag_maxfamilyclients_unlimited' in data) {
      this.maxFamilyClientsUnlimited = data.channel_flag_maxfamilyclients_unlimited === '1';
    }
    if ('channel_flag_maxfamilyclients_inherited' in data) {
      this.maxFamilyClientsInherited = data.channel_flag_maxfamilyclients_inherited === '1';
    }
    if ('channel_filepath' in data) {
      this.filepath = data.channel_filepath!;
    }
    if ('channel_needed_talk_power' in data) {
      this.neededTalkPower = Number(data.channel_needed_talk_power!);
    }
    if ('channel_forced_silence' in data) {
      this.forcedSilence = data.channel_forced_silence === '1';
    }
    if ('channel_name_phonetic' in data) {
      this.namePhonetic = data.channel_name_phonetic!;
    }
    if ('channel_icon_id' in data) {
      this.iconId = Number(data.channel_icon_id!);
    }
    if ('channel_banner_gfx_url' in data) {
      this.bannerGfxUrl = data.channel_banner_gfx_url!;
    }
    if ('channel_banner_mode' in data) {
      this.bannerMode = Number(data.channel_banner_mode!);
    }
    if ('seconds_empty' in data) {
      this.secondsEmpty = Number(data.seconds_empty!);
    }
  }

  /**
   * Checks if the channel is partially filled.
   * @returns {boolean} Whether the channel is partially filled.
   */
  get partial(): boolean {
    return (
      typeof this.name !== 'string' ||
      typeof this.description !== 'string' ||
      typeof this.topic !== 'string' ||
      typeof this.uniqueId !== 'string'
    );
  }

  /**
   * Gets the parent channel of this channel.
   * @returns {Channel | null} The parent channel, or null if there is none.
   */
  get parent(): Channel | null {
    return this.parentId ? this.query.channels.cache.get(this.parentId)! : null;
  }

  /**
   * Gets the child channels of this channel.
   * @returns {Collection<number, Channel>} The child channels.
   */
  get children(): Collection<number, Channel> {
    return this.query.channels.cache.filter((channel) => channel.parentId === this.id);
  }

  /**
   * Fetches the channel from the server or the cache.
   * @param {boolean} [force=false] Whether to force a fetch from the server.
   * @returns {Promise<Channel>} The fetched channel.
   */
  fetch(force: boolean = false): Promise<Channel> {
    return this.query.channels.fetch(this, { force });
  }

  /**
   * Edits the channel with new data.
   * @param {ChannelEditOptions} data The new data to patch the channel with.
   * @returns {Promise<Channel>} The updated channel.
   */
  edit(data: ChannelEditOptions): Promise<Channel> {
    return this.query.channels.edit(this, data);
  }

  /**
   * Deletes the channel.
   * @param {boolean} [force=false] Whether to force the deletion. Forcing deletion will kick all clients from the channel.
   * @returns {Promise<void>}
   */
  delete(force: boolean = false): Promise<void> {
    return this.query.channels.delete(this, force);
  }

  /**
   * Kicks a client from the channel.
   * @param {ClientResolvable} client The client to kick.
   * @param {string} [reason] The reason for the kick.
   * @returns {Promise<void>}
   */
  kickClient(client: ClientResolvable, reason?: string): Promise<void> {
    return this.query.clients.kickFromChannel(client, reason);
  }

  /**
   * Moves the channel.
   * @param {ChannelMoveOptions} options The options for moving the channel.
   * @returns {Promise<Channel>} The moved channel.
   */
  move(options: ChannelMoveOptions): Promise<Channel> {
    return this.query.channels.move(this, options);
  }
}
