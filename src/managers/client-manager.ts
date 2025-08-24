import { Collection } from '@discordjs/collection';
import { Query } from '../query';
import Client from '../structures/client';
import CachedManager from './cached-manager';
import { BaseFetchOptions, ChannelResolvable, ClientResolvable } from '../typings/types';
import CommandError from '../errors/command-error';
import {
  KickReasonIdentifier,
  RawClient,
  RawClientFindItem,
  TextMessageTargetMode,
} from '../typings/teamspeak';
import { stringifyValues } from '../utils/helpers';

export type ClientEditOptions = {
  nickname?: string;
  isTalker?: boolean;
  description?: string;
};

export default class ClientManager extends CachedManager<Client, RawClient> {
  constructor(query: Query) {
    super(query, Client, 'clid');
  }

  resolveId(client: ClientResolvable): number {
    if (client instanceof Client) return client.id;
    return client;
  }

  async fetch(
    client: ClientResolvable,
    options?: BaseFetchOptions,
  ): Promise<Awaited<ReturnType<ClientManager['_fetchSingle']>>>;
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

  kickFromChannel(client: ClientResolvable, reason?: string): Promise<void> {
    const id = this.resolveId(client);
    return this.query.commands.clientkick({
      clid: id,
      reasonid: KickReasonIdentifier.CHANNEL,
      reasonmsg: reason,
    });
  }

  kickFromServer(client: ClientResolvable, reason?: string): Promise<void> {
    const id = this.resolveId(client);
    return this.query.commands.clientkick({
      clid: id,
      reasonid: KickReasonIdentifier.SERVER,
      reasonmsg: reason,
    });
  }

  sendMessage(client: ClientResolvable, content: string): Promise<void> {
    const id = this.resolveId(client);

    return this.query.commands.sendtextmessage({
      targetmode: TextMessageTargetMode.CLIENT,
      target: id,
      msg: content,
    });
  }

  poke(client: ClientResolvable, content: string): Promise<void> {
    const id = this.resolveId(client);

    return this.query.commands.clientpoke({
      clid: id,
      msg: content,
    });
  }

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
}
