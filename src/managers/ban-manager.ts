import { Collection } from '@discordjs/collection';
import { Query } from '../query';
import { RawBan } from '../typings/teamspeak';
import { CachedManager } from './cached-manager';
import { BanResolvable, ClientResolvable } from '../typings/types';
import { Ban } from '../structures/ban';
import { CommandError } from '../errors/command-error';

type BanCreateOptions = {
  /**
   * The IP address to ban.
   */
  ip?: string;

  /**
   * The name to ban.
   */
  name?: string;

  /**
   * The unique ID to ban.
   */
  uniqueId?: string;

  /**
   * The MyTeamspeak ID to ban.
   */
  myTeamspeakId?: string;

  /**
   * The duration of the ban in seconds. Defaults to 0, which means permanent.
   */
  duration?: number;

  /**
   * The reason for the ban.
   */
  reason?: string;

  /**
   * The last nickname of the client.
   */
  lastNickname?: string;
};

export type BanClientOptions = {
  /**
   * The duration of the ban in seconds. Defaults to 0, which means permanent.
   */
  duration?: number;

  /**
   * The reason for the ban.
   */
  reason?: string;
};

/**
 * Manages the bans in the TeamSpeak server.
 */
export class BanManager extends CachedManager<Ban, RawBan> {
  constructor(query: Query) {
    super(query, Ban, 'banid');
  }

  /**
   * Resolves a ban ID.
   * @param {BanResolvable} ban The object to resolve.
   * @returns {number} The ban ID.
   */
  resolveId(ban: BanResolvable): number {
    if (ban instanceof Ban) return ban.id;
    return ban;
  }

  /**
   * Fetches all bans.
   * @returns {Promise<Collection<number, Ban>>} A promise that resolves with a collection of bans.
   */
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

  /**
   * Creates a ban.
   * @param {BanCreateOptions} data The options for creating the ban.
   * @returns {Promise<void>} A promise that resolves when the ban has been created.
   */
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

  /**
   * Bans a client. Since TeamSpeak creates multiple ban entries for one client, this returns a collection of bans.
   * @param {ClientResolvable} client The client to ban.
   * @param {BanClientOptions} options The options for banning the client.
   * @returns {Promise<Collection<number, Ban>>} A promise that resolves with a collection of bans.
   */
  async banClient(
    client: ClientResolvable,
    options: BanClientOptions = {},
  ): Promise<Collection<number, Ban>> {
    const payload = {
      clid: this.query.clients.resolveId(client),
      time: options.duration,
      banreason: options.reason,
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

  /**
   * Deletes a ban.
   * @param {BanResolvable} ban The ban to delete.
   * @returns {Promise<void>} A promise that resolves when the ban has been deleted.
   */
  async delete(ban: BanResolvable): Promise<void> {
    const id = this.resolveId(ban);
    await this.query.commands.bandel({ banid: id });
    this.query.actions.BanDelete.handle({ banid: id.toString() });
  }

  //TODO: Implement the Action for this properly

  /**
   * Deletes all bans.
   * @returns {Promise<void>} A promise that resolves when the bans have been deleted.
   */
  async deleteAll(): Promise<void> {
    await this.query.commands.bandelall();
    this.cache.clear();
  }
}
