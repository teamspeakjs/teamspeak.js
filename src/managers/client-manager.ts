import { Collection } from '@discordjs/collection';
import { Query } from '../query';
import Client from '../structures/client';
import CachedManager from './cached-manager';
import { ClientResolvable, RawClient } from '../typings/types';
import CommandError from '../errors/command-error';

export default class ClientManager extends CachedManager<Client> {
  constructor(query: Query) {
    super(query, Client, 'clid');
  }

  resolveId(client: ClientResolvable) {
    if (client instanceof Client) return client.id;
    return client;
  }

  async fetch(
    client: ClientResolvable,
    options?: { cache?: boolean; force?: boolean },
  ): Promise<Awaited<ReturnType<ClientManager['_fetchSingle']>>>;
  async fetch(): Promise<Awaited<ReturnType<ClientManager['_fetchAll']>>>;

  async fetch(client?: ClientResolvable, { cache = true, force = false } = {}) {
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
    cache?: boolean;
    force?: boolean;
  }) {
    const id = this.resolveId(client);

    if (!force) {
      const existing = this.cache.get(id);
      if (existing && !existing.partial) return existing;
    }

    const data = await this.query.commands.clientinfo({ clid: id });

    return this._add(
      {
        ...data,
        clid: id,
      },
      cache,
    );
  }

  protected async _fetchAll() {
    const _data = await this.query.commands.clientlist();
    const data = Array.isArray(_data) ? _data : [_data];

    const clients = new Collection<number, Client>();

    for (const client of data) {
      clients.set(Number(client.clid), this._add(client));
    }

    return clients;
  }

  async search(query: string) {
    let _data: RawClient | RawClient[] = [];
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

  async kickFromChannel(client: ClientResolvable, reason?: string) {
    const id = this.resolveId(client);
    return this.query.commands.clientkick({
      clid: id,
      reasonid: 4,
      reasonmsg: reason,
    });
  }

  async kickFromServer(client: ClientResolvable, reason?: string) {
    const id = this.resolveId(client);
    return this.query.commands.clientkick({
      clid: id,
      reasonid: 5,
      reasonmsg: reason,
    });
  }

  async sendMessage(client: ClientResolvable, content: string) {
    const id = this.resolveId(client);

    return this.query.commands.sendtextmessage({
      targetmode: 1,
      target: id,
      msg: content,
    });
  }
}
