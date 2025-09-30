import { Collection } from '@discordjs/collection';
import { Query } from '../query';
import { RawPrivilegeKey } from '../typings/teamspeak';
import { PrivilegeKey } from '../structures/privilege-key';
import {
  ChannelGroupResolvable,
  ChannelResolvable,
  PrivilegeKeyResolvable,
  PrivilegeKeyType,
  ServerGroupResolvable,
} from '../typings/types';
import { CachedManager } from './cached-manager';
import { fnv1aHash32, stringifyValues } from '../utils/helpers';
import { CommandError } from '../errors/command-error';

type PrivilegeKeyCreateOptions = {
  /**
   * The description of the privilege key.
   */
  description?: string;

  /**
   * The custom set of the privilege key.
   */
  customSet?: string;
};

type PrivilegeKeyCreateOptions_ServerGroup = PrivilegeKeyCreateOptions & {
  /**
   * The server group of the privilege key.
   */
  serverGroup: ServerGroupResolvable;

  channelGroup?: never;

  channel?: never;
};

type PrivilegeKeyCreateOptions_ChannelGroup = PrivilegeKeyCreateOptions & {
  /**
   * The channel group of the privilege key.
   */
  channelGroup: ChannelGroupResolvable;

  /**
   * The channel of the privilege key.
   */
  channel: ChannelResolvable;

  serverGroup?: never;
};

/**
 * Manages the privilege keys in the TeamSpeak server.
 *
 * Notice: This is experimental and may be inaccurate as the API does not return the ID of the privilege key.
 */
export class PrivilegeKeyManager extends CachedManager<PrivilegeKey, RawPrivilegeKey> {
  constructor(query: Query) {
    super(query, PrivilegeKey, 'id');
  }

  resolveId(privilegeKey: PrivilegeKeyResolvable): number {
    if (privilegeKey instanceof PrivilegeKey) return privilegeKey.id;

    return privilegeKey;
  }

  makeId({ token }: { token: string }): number {
    return fnv1aHash32(token);
  }

  /**
   * Fetches all privilege keys from the TeamSpeak server.
   * @returns {Promise<Collection<number, PrivilegeKey>>} A promise that resolves with a collection of privilege keys.
   */
  async fetch(): Promise<Collection<number, PrivilegeKey>> {
    let _data: RawPrivilegeKey | RawPrivilegeKey[] = [];
    try {
      _data = await this.query.commands.privilegekeylist();
    } catch (error) {
      if (error instanceof CommandError && error.id === 1281) {
        return new Collection<number, PrivilegeKey>();
      }
    }
    const data = Array.isArray(_data) ? _data : [_data];

    const keys = new Collection<number, PrivilegeKey>();

    for (const raw of data) {
      const key = this._add(raw);
      keys.set(key.id, key);
    }

    // TODO: Can this be optimized?
    // There is a small chance that a ID is generated twice, which would cause the list to be inaccurate (less entries than expected)
    if (keys.size !== data.length) {
      throw new Error(
        'Privilege key list is not accurate. ID generation is not working correctly.',
      );
    }

    return keys;
  }

  /**
   * Creates a new privilege key for a server group.
   * @param options The options for creating the privilege key.
   * @returns The created privilege key.
   */
  async create(options: PrivilegeKeyCreateOptions_ServerGroup): Promise<PrivilegeKey>;

  /**
   * Creates a new privilege key for a channel group.
   * @param options The options for creating the privilege key.
   * @returns The created privilege key.
   */
  async create(options: PrivilegeKeyCreateOptions_ChannelGroup): Promise<PrivilegeKey>;

  async create(
    options: PrivilegeKeyCreateOptions_ServerGroup | PrivilegeKeyCreateOptions_ChannelGroup,
  ): Promise<PrivilegeKey> {
    const type = options.serverGroup ? PrivilegeKeyType.ServerGroup : PrivilegeKeyType.ChannelGroup;

    const resolvedId1 =
      type === PrivilegeKeyType.ServerGroup
        ? this.query.serverGroups.resolveId(options.serverGroup as ServerGroupResolvable)
        : this.query.channelGroups.resolveId(options.channelGroup as ChannelGroupResolvable);

    const resolvedId2 = options.channel ? this.query.channels.resolveId(options.channel) : 0;

    const payload = {
      tokentype: type,
      tokenid1: resolvedId1,
      tokenid2: resolvedId2,
      tokendescription: options.description,
      customset: options.customSet,
    };

    const { token } = await this.query.commands.privilegekeyadd(payload);
    return this.query.actions.PrivilegeKeyCreate.handle({ token, ...stringifyValues(payload) })
      .privilegeKey;
  }

  /**
   * Deletes a privilege key.
   * @param privilegeKey The privilege key to delete.
   * @returns The deleted privilege key.
   */
  async delete(privilegeKey: PrivilegeKeyResolvable): Promise<void> {
    const id = this.resolveId(privilegeKey);

    // TODO: Can this be optimized?
    const pk = this.cache.get(id);
    if (!pk) throw new Error('Privilege key not found');

    await this.query.commands.privilegekeydelete({ token: pk.token! });
    this.query.actions.PrivilegeKeyDelete.handle({ id: id.toString() });
  }

  /**
   * Uses a privilege key.
   * @param privilegeKey The privilege key to use.
   * @returns {Promise<void>} A promise that resolves when the privilege key is used.
   */
  async use(privilegeKey: PrivilegeKeyResolvable): Promise<void> {
    const id = this.resolveId(privilegeKey);

    // TODO: Can this be optimized?
    const pk = this.cache.get(id);
    if (!pk) throw new Error('Privilege key not found');

    return this.query.commands.privilegekeyuse({ token: pk.token! });
  }

  // TODO: Add deleteByToken and useByToken to delete and use methods directly.

  /**
   * Deletes a privilege key by its token.
   * @param token The token of the privilege key to delete.
   * @returns {Promise<void>} A promise that resolves when the privilege key is deleted.
   */
  deleteByToken(token: string): Promise<void> {
    return this.query.commands.privilegekeydelete({ token });
  }

  /**
   * Uses a privilege key by its token.
   * @param token The token of the privilege key to use.
   * @returns {Promise<void>} A promise that resolves when the privilege key is used.
   */
  useByToken(token: string): Promise<void> {
    return this.query.commands.privilegekeyuse({ token });
  }
}
