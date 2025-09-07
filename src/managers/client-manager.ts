import { Collection } from '@discordjs/collection';
import { Query } from '../query';
import { Client } from '../structures/client';
import { CachedManager } from './cached-manager';
import {
  BaseFetchOptions,
  ChannelResolvable,
  ClientResolvable,
  ServerGroupResolvable,
} from '../typings/types';
import { CommandError } from '../errors/command-error';
import {
  KickReasonIdentifier,
  RawClient,
  RawClientFindItem,
  TextMessageTargetMode,
} from '../typings/teamspeak';
import { stringifyValues } from '../utils/helpers';
import { ServerGroup } from '../structures/server-group';

export type ClientEditOptions = {
  nickname?: string;
  isTalker?: boolean;
  description?: string;
};

/**
 * Manages the clients in the TeamSpeak server.
 */
export class ClientManager extends CachedManager<Client, RawClient> {
  constructor(query: Query) {
    super(query, Client, 'clid');
  }

  /**
   * Resolves a client ID.
   * @param {ClientResolvable} client The object to resolve.
   * @returns {number} The client ID.
   */
  resolveId(client: ClientResolvable): number {
    if (client instanceof Client) return client.id;
    return client;
  }

  /**
   * Obtains a client from TeamSpeak, or the cache if it's available.
   * @param {ClientResolvable} client The client to fetch.
   * @param {BaseFetchOptions} options The options for fetching the client.
   * @returns {Promise<Client>} The client.
   */
  async fetch(
    client: ClientResolvable,
    options?: BaseFetchOptions,
  ): Promise<Awaited<ReturnType<ClientManager['_fetchSingle']>>>;

  /**
   * Obtains all clients from TeamSpeak.
   * @returns {Promise<Collection<number, Client>>} The clients.
   */
  async fetch(): Promise<Awaited<ReturnType<ClientManager['_fetchAll']>>>;

  async fetch(
    client?: ClientResolvable,
    { cache = true, force = false }: BaseFetchOptions = {},
  ): Promise<Awaited<ReturnType<typeof this._fetchSingle | typeof this._fetchAll>>> {
    if (client) {
      return this._fetchSingle({ client, cache, force });
    } else {
      return this._fetchAll();
    }
  }

  protected async _fetchSingle({
    client,
    cache,
    force = false,
  }: {
    client: ClientResolvable;
  } & BaseFetchOptions): Promise<Client> {
    const id = this.resolveId(client);

    if (!force) {
      const existing = this.cache.get(id);
      if (existing && !existing.partial) return existing;
    }

    const data = await this.query.commands.clientinfo({ clid: id });

    return this._add(
      {
        ...data,
        clid: id.toString(),
      },
      cache,
    );
  }

  protected async _fetchAll(): Promise<Collection<number, Client>> {
    const _data = await this.query.commands.clientlist();
    const data = Array.isArray(_data) ? _data : [_data];

    const clients = new Collection<number, Client>();

    for (const client of data) {
      clients.set(Number(client.clid), this._add(client));
    }

    return clients;
  }

  //TODO: Find a cleaner approach for this payload stuff?

  /**
   * Edits a client.
   * @param {ClientResolvable} client The client to edit.
   * @param {ClientEditOptions} data The new client data.
   * @returns {Promise<Client>} The updated client.
   */
  async edit(client: ClientResolvable, data: ClientEditOptions): Promise<Client> {
    const id = this.resolveId(client);

    const payload = {
      clid: id,
      client_nickname: data.nickname,
      client_is_talker: data.isTalker,
      client_description: data.description,
    };

    // Note:
    // Self client edits are handled via clientupdate;
    // Other client edits via clientedit;
    // Self client can only edit their own nickname;
    // Other clients can be edited their description and isTalker;
    if (id === this.query.client.id) {
      await this.query.commands.clientupdate(payload);
    } else {
      await this.query.commands.clientedit(payload);
    }

    return this.query.actions.ClientUpdate.handle(stringifyValues(payload)).after!;
  }

  /**
   * Searches for clients based on the client nickname.
   * @param {string} query The search query.
   * @returns {Promise<Collection<number, Client>>} The found clients.
   */
  async search(query: string): Promise<Collection<number, Client>> {
    let _data: RawClientFindItem | RawClientFindItem[] = [];
    try {
      _data = await this.query.commands.clientfind({ pattern: query });
    } catch (error) {
      if (error instanceof CommandError && error.id === 512) {
        return new Collection<number, Client>();
      }

      throw error;
    }

    const data = Array.isArray(_data) ? _data : [_data];

    const clients = new Collection<number, Client>();

    for (const client of data) {
      clients.set(Number(client.clid), this._add(client));
    }

    return clients;
  }

  /**
   * Kicks a client from the current channel.
   * @param {ClientResolvable} client The client to kick.
   * @param {string} [reason] The reason for the kick.
   * @returns {Promise<void>} A promise that resolves when the client has been kicked.
   */
  kickFromChannel(client: ClientResolvable, reason?: string): Promise<void> {
    const id = this.resolveId(client);
    return this.query.commands.clientkick({
      clid: id,
      reasonid: KickReasonIdentifier.CHANNEL,
      reasonmsg: reason,
    });
  }

  /**
   * Kicks a client from the server.
   * @param {ClientResolvable} client The client to kick.
   * @param {string} [reason] The reason for the kick.
   * @returns {Promise<void>} A promise that resolves when the client has been kicked.
   */
  kickFromServer(client: ClientResolvable, reason?: string): Promise<void> {
    const id = this.resolveId(client);
    return this.query.commands.clientkick({
      clid: id,
      reasonid: KickReasonIdentifier.SERVER,
      reasonmsg: reason,
    });
  }

  /**
   * Sends a message to a client.
   * @param {ClientResolvable} client The client to send the message to.
   * @param {string} content The content of the message.
   * @returns {Promise<void>} A promise that resolves when the message has been sent.
   */
  sendMessage(client: ClientResolvable, content: string): Promise<void> {
    const id = this.resolveId(client);

    return this.query.commands.sendtextmessage({
      targetmode: TextMessageTargetMode.CLIENT,
      target: id,
      msg: content,
    });
  }

  /**
   * Pokes a client.
   * @param {ClientResolvable} client The client to poke.
   * @param {string} content The content of the poke.
   * @returns {Promise<void>} A promise that resolves when the poke has been sent.
   */
  poke(client: ClientResolvable, content: string): Promise<void> {
    const id = this.resolveId(client);

    return this.query.commands.clientpoke({
      clid: id,
      msg: content,
    });
  }

  /**
   * Moves a client to a different channel.
   * @param {ClientResolvable} client The client to move.
   * @param {ChannelResolvable} channel The channel to move the client to.
   * @param {string} [channelPassword] The password for the channel, if required.
   * @returns {Promise<Client>} A promise that resolves to the moved client.
   */
  async move(
    client: ClientResolvable,
    channel: ChannelResolvable,
    channelPassword?: string,
  ): Promise<Client> {
    const clientId = this.resolveId(client);
    const channelId = this.query.channels.resolveId(channel);

    await this.query.commands.clientmove({
      clid: clientId,
      cid: channelId,
      cpw: channelPassword,
    });

    return this.query.actions.ClientMove.handle({
      ctid: channelId.toString(),
      clid: clientId.toString(),
      reasonid: '1',
      invokerid: this.query.client.id.toString(),
      invokername: this.query.client.nickname!,
      invokeruid: this.query.client.uniqueId!,
    }).client!;
  }

  /**
   * Adds a client to a server group.
   * @param {ClientResolvable} client The client to add.
   * @param {ServerGroupResolvable} serverGroup The server group to add the client to.
   */
  async addServerGroup(
    client: ClientResolvable,
    serverGroup: ServerGroupResolvable,
  ): Promise<void> {
    const clientId = this.resolveId(client);
    const serverGroupId = this.query.serverGroups.resolveId(serverGroup);

    const fetchedClient = await this.fetch(clientId, { force: true });

    await this.query.commands.servergroupaddclient({
      sgid: serverGroupId,
      cldbid: fetchedClient.databaseId!,
    });
  }

  /**
   * Removes a client from a server group.
   * @param {ClientResolvable} client The client to remove.
   * @param {ServerGroupResolvable} serverGroup The server group to remove the client from.
   */
  async removeServerGroup(
    client: ClientResolvable,
    serverGroup: ServerGroupResolvable,
  ): Promise<void> {
    const clientId = this.resolveId(client);
    const serverGroupId = this.query.serverGroups.resolveId(serverGroup);

    const fetchedClient = await this.fetch(clientId, { force: true });

    await this.query.commands.servergroupdelclient({
      sgid: serverGroupId,
      cldbid: fetchedClient.databaseId!,
    });
  }

  /**
   * Fetches the server groups a client is in.
   * @param {ClientResolvable} client The client to fetch server groups for.
   * @returns {Promise<Collection<number, ServerGroup>>} A promise that resolves to a collection of server groups.
   */
  async fetchServerGroups(client: ClientResolvable): Promise<Collection<number, ServerGroup>> {
    const clientId = this.resolveId(client);

    const fetchedClient = await this.fetch(clientId, { force: true });

    const _data = await this.query.commands.servergroupsbyclientid({
      cldbid: fetchedClient.databaseId!,
    });

    const data = Array.isArray(_data) ? _data : [_data];

    const serverGroups = new Collection<number, ServerGroup>();

    for (const group of data) {
      serverGroups.set(Number(group.sgid), this.query.serverGroups._add(group));
    }

    return serverGroups;
  }
}
