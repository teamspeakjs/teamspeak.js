import { Collection } from '@discordjs/collection';
import { ClientEditOptions } from '../managers/client-manager';
import { Query } from '../query';
import { RawClient } from '../typings/teamspeak';
import { ChannelResolvable, ServerGroupResolvable } from '../typings/types';
import Base from './base';
import Channel from './channel';
import ServerGroup from './server-group';
import Ban from './ban';

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

  /**
   * Patches the client with new data.
   * @param {Partial<RawClient>} data The new data to patch the client with.
   */
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

  /**
   * Checks if the client is partially filled.
   * @returns {boolean} Whether the client is partially filled.
   */
  get partial(): boolean {
    return (
      typeof this.nickname !== 'string' ||
      typeof this.databaseId !== 'number' ||
      typeof this.description !== 'string'
    );
  }

  /**
   * Gets the channel the client is in.
   * @returns {Channel | null} The channel the client is in, or null if unknown.
   */
  get channel(): Channel | null {
    return this.channelId ? this.query.channels.cache.get(this.channelId)! : null;
  }

  /**
   * Fetches the client from the server or the cache.
   * @param {boolean} [force=false] Whether to force the fetch.
   * @returns {Promise<Client>} The fetched client.
   */
  fetch(force: boolean = false): Promise<Client> {
    return this.query.clients.fetch(this, { force });
  }

  /**
   * Edits the client with new data.
   * @param {ClientEditOptions} data The new data to patch the client with.
   * @returns {Promise<Client>} The updated client.
   */
  edit(data: ClientEditOptions): Promise<Client> {
    return this.query.clients.edit(this, data);
  }

  /**
   * Kicks the client from the current channel.
   * @param {string} [reason] The reason for the kick.
   * @returns {Promise<void>} A promise that resolves when the client has been kicked.
   */
  kickFromChannel(reason?: string): Promise<void> {
    return this.query.clients.kickFromChannel(this, reason);
  }

  /**
   * Kicks the client from the server.
   * @param {string} [reason] The reason for the kick.
   * @returns {Promise<void>} A promise that resolves when the client has been kicked.
   */
  kickFromServer(reason?: string): Promise<void> {
    return this.query.clients.kickFromServer(this, reason);
  }

  /**
   * Sends a message to the client.
   * @param {string} content The content of the message.
   * @returns {Promise<void>} A promise that resolves when the message has been sent.
   */
  sendMessage(content: string): Promise<void> {
    return this.query.clients.sendMessage(this, content);
  }

  /**
   * Pokes the client.
   * @param {string} content The content of the poke message.
   * @returns {Promise<void>} A promise that resolves when the poke has been sent.
   */
  poke(content: string): Promise<void> {
    return this.query.clients.poke(this, content);
  }

  /**
   * Moves the client to a different channel.
   * @param {ChannelResolvable} channel The channel to move the client to.
   * @param {string} [channelPassword] The password for the channel, if required.
   * @returns {Promise<Client>} A promise that resolves to the moved client.
   */
  move(channel: ChannelResolvable, channelPassword?: string): Promise<Client> {
    return this.query.clients.move(this, channel, channelPassword);
  }

  /**
   * Sets the description of the client.
   * @param {string} description The new description.
   * @returns {Promise<Client>} The updated client.
   */
  setDescription(description: string): Promise<Client> {
    return this.query.clients.edit(this, { description });
  }

  /**
   * Sets whether the client is a talker.
   * @param {boolean} isTalker Whether the client is a talker.
   * @returns {Promise<Client>} The updated client.
   */
  setTalker(isTalker: boolean): Promise<Client> {
    return this.query.clients.edit(this, { isTalker });
  }

  /**
   * Adds a server group to the client.
   * @param {ServerGroupResolvable} serverGroup The server group to add.
   * @returns {Promise<void>} A promise that resolves when the server group has been added.
   */
  addServerGroup(serverGroup: ServerGroupResolvable): Promise<void> {
    return this.query.clients.addServerGroup(this, serverGroup);
  }

  /**
   * Removes a server group from the client.
   * @param {ServerGroupResolvable} serverGroup The server group to remove.
   * @returns {Promise<void>} A promise that resolves when the server group has been removed.
   */
  removeServerGroup(serverGroup: ServerGroupResolvable): Promise<void> {
    return this.query.clients.removeServerGroup(this, serverGroup);
  }

  /**
   * Fetches the server groups the client belongs to.
   * @returns {Promise<Collection<number, ServerGroup>>} The server groups the client belongs to.
   */
  async fetchServerGroups(): Promise<Collection<number, ServerGroup>> {
    return this.query.clients.fetchServerGroups(this);
  }

  /**
   * Bans the client from the server.
   * @param {Object} options The options for the ban.
   * @param {number} [options.duration] The duration of the ban in seconds (Optional, defaults to 0, which means permanent).
   * @param {string} [options.reason] The reason for the ban (Optional).
   * @returns {Promise<Collection<number, Ban>>} The bans applied to the client. TeamSpeak creates multiple ban entries for one client.
   */
  ban({ duration, reason }: { duration?: number; reason?: string } = {}): Promise<
    Collection<number, Ban>
  > {
    return this.query.bans.banClient(this, { duration, reason });
  }

  /**
   * Converts the client to a string representation.
   * @returns {string} The string representation of the client.
   */
  toString(): string {
    return `[URL=client://${this.id}/${this.uniqueId}~${this.nickname}]${this.nickname}[/URL]`;
  }
}
