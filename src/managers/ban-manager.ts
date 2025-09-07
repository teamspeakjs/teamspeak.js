import { Collection } from '@discordjs/collection';
import { Query } from '../query';
import { RawBan } from '../typings/teamspeak';
import { CachedManager } from './cached-manager';
import { BanResolvable, ClientResolvable } from '../typings/types';
import { Ban } from '../structures/ban';
import { CommandError } from '../errors/command-error';

type BanCreateOptions = {
  ip?: string;
  name?: string;
  uniqueId?: string;
  myTeamspeakId?: string;
  duration?: number;
  reason?: string;
  lastNickname?: string;
};

/**
 * Manages the bans in the TeamSpeak server.
 */
export class BanManager extends CachedManager<Ban, RawBan> {
  constructor(query: Query) {
    super(query, Ban, 'banid');
  }

  resolveId(ban: BanResolvable): number {
    if (ban instanceof Ban) return ban.id;
    return ban;
  }

  async fetch(): Promise<Collection<number, Ban>> {
    let _data: RawBan | RawBan[] = [];
    try {
      _data = await this.query.commands.banlist();
    } catch (error) {
      if (error instanceof CommandError && error.id === 1281) {
        return new Collection<number, Ban>();
      }

      throw error;
    }

    const data = Array.isArray(_data) ? _data : [_data];

    const bans = new Collection<number, Ban>();

    for (const ban of data) {
      bans.set(Number(ban.banid), this._add(ban));
    }

    return bans;
  }

  //Notice: This does not trigger the Action since it does not return anything
  async create(data: BanCreateOptions): Promise<void> {
    const payload = {
      ip: data.ip,
      name: data.name,
      uid: data.uniqueId,
      mytsid: data.myTeamspeakId,
      time: data.duration,
      banreason: data.reason,
      lastnickname: data.lastNickname,
    };

    return this.query.commands.banadd(payload);
  }

  async banClient(
    client: ClientResolvable,
    { duration, reason }: { duration?: number; reason?: string } = {},
  ): Promise<Collection<number, Ban>> {
    const payload = {
      clid: this.query.clients.resolveId(client),
      time: duration,
      banreason: reason,
    };

    const _data = await this.query.commands.banclient(payload);
    const data = Array.isArray(_data) ? _data : [_data];

    const bans = new Collection<number, Ban>();

    for (const _ban of data) {
      const ban = this.query.actions.BanCreate.handle(_ban).ban;
      bans.set(Number(ban.id), ban);
    }

    return bans;
  }

  async delete(ban: BanResolvable): Promise<void> {
    const id = this.resolveId(ban);
    await this.query.commands.bandel({ banid: id });
    this.query.actions.BanDelete.handle({ banid: id.toString() });
  }

  //TODO: Implement the Action for this properly
  async deleteAll(): Promise<void> {
    await this.query.commands.bandelall();
    this.cache.clear();
  }
}
