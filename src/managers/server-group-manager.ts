import { Collection } from '@discordjs/collection';
import { Query } from '../query';
import { ServerGroup } from '../structures/server-group';
import { RawServerGroup } from '../typings/teamspeak';
import { CachedManager } from './cached-manager';
import { ClientResolvable, ServerGroupResolvable, ServerGroupType } from '../typings/types';

type ServerGroupCreateOptions = {
  name: string;
  type?: ServerGroupType;
};

/**
 * Manages the server groups in the TeamSpeak server.
 */
export class ServerGroupManager extends CachedManager<ServerGroup, RawServerGroup> {
  constructor(query: Query) {
    super(query, ServerGroup, 'sgid');
  }

  /**
   * Resolves a server group ID.
   * @param {ServerGroupResolvable} serverGroup The object to resolve.
   * @returns {number} The server group ID.
   */
  resolveId(serverGroup: ServerGroupResolvable): number {
    if (serverGroup instanceof ServerGroup) return serverGroup.id;
    return serverGroup;
  }

  /**
   * Obtains all server groups from TeamSpeak.
   * @returns {Promise<Collection<number, ServerGroup>>} The server groups.
   */
  async fetch(): Promise<Collection<number, ServerGroup>> {
    const _data = await this.query.commands.servergrouplist();
    const data = Array.isArray(_data) ? _data : [_data];

    const groups = new Collection<number, ServerGroup>();

    for (const group of data) {
      groups.set(Number(group.sgid), this._add(group));
    }

    return groups;
  }

  /**
   * Creates a new server group.
   * @param {ServerGroupCreateOptions} options The options for creating the server group.
   * @property {string} options.name The name of the server group.
   * @property {ServerGroupType} [options.type=1] The type of the server group. Default is 1 (Regular).
   * @returns {Promise<ServerGroup>} The created server group.
   */
  async create(options: ServerGroupCreateOptions): Promise<ServerGroup> {
    const data = await this.query.commands.servergroupadd(options);
    return this.query.actions.ServerGroupCreate.handle({
      sgid: data.sgid,
      name: options.name,
      type: options.type ? options.type.toString() : undefined,
    }).serverGroup;
  }

  /**
   * Deletes a server group.
   * @param {ServerGroupResolvable} serverGroup The server group to delete.
   * @param {boolean} [force=false] Whether to force the deletion. Force deletion will remove the server group from all clients.
   * @returns {Promise<void>} A promise that resolves when the server group has been deleted.
   */
  async delete(serverGroup: ServerGroupResolvable, force: boolean = false): Promise<void> {
    const id = this.resolveId(serverGroup);
    await this.query.commands.servergroupdel({ sgid: id, force });
    this.query.actions.ServerGroupDelete.handle({ sgid: id.toString() });
  }

  /**
   * Renames a server group.
   * @param {ServerGroupResolvable} serverGroup The server group to rename.
   * @param {string} name The new name for the server group.
   * @returns {Promise<ServerGroup>} The updated server group.
   */
  async rename(serverGroup: ServerGroupResolvable, name: string): Promise<ServerGroup> {
    const id = this.resolveId(serverGroup);
    await this.query.commands.servergrouprename({ sgid: id, name });
    return this.query.actions.ServerGroupUpdate.handle({ sgid: id.toString(), name }).after!;
  }

  /**
   * Adds a client to a server group.
   * @param {ServerGroupResolvable} serverGroup The server group to add the client to.
   * @param {ClientResolvable} client The client to add.
   * @returns {Promise<void>} A promise that resolves when the client has been added.
   */
  addClient(serverGroup: ServerGroupResolvable, client: ClientResolvable): Promise<void> {
    return this.query.clients.addServerGroup(client, serverGroup);
  }

  /**
   * Removes a client from a server group.
   * @param {ServerGroupResolvable} serverGroup The server group to remove the client from.
   * @param {ClientResolvable} client The client to remove.
   * @returns {Promise<void>} A promise that resolves when the client has been removed.
   */
  removeClient(serverGroup: ServerGroupResolvable, client: ClientResolvable): Promise<void> {
    return this.query.clients.removeServerGroup(client, serverGroup);
  }

  /**
   * Fetches the client database IDs from a server group.
   * @param {ServerGroupResolvable} serverGroup The server group to fetch the client database IDs from.
   * @returns {Promise<number[]>} A promise that resolves with the client database IDs.
   */
  async fetchClientDatabaseIds(serverGroup: ServerGroupResolvable): Promise<number[]> {
    const id = this.resolveId(serverGroup);
    const _data = await this.query.commands.servergroupclientlist({ sgid: id }); //TODO: Add support for _names
    if (_data === null) return [];
    const data = Array.isArray(_data) ? _data : [_data];

    return data.map(({ cldbid }) => Number(cldbid));
  }

  /**
   * Copies a server group into a new server group.
   *
   * @param {ServerGroup} sourceGroup The source server group to copy.
   * @param {object} options The options for copying the server group.
   * @property {ServerGroupType} type The type of the new server group.
   * @property {string} name The name of the new server group.
   * @returns {Promise<ServerGroup>} The created server group.
   */
  async copy(
    sourceGroup: ServerGroupResolvable,
    options: { type: ServerGroupType; targetGroup?: never; name: string },
  ): Promise<ServerGroup>;

  /**
   * Copies a server group into an existing server group.
   *
   * @param {ServerGroup} sourceGroup The source server group to copy.
   * @param {object} options The options for copying the server group.
   * @property {ServerGroupType} type The type of the new server group.
   * @property {ServerGroup} targetGroup The target server group to copy to.
   * @returns {Promise<null>} A promise that resolves when the server group has been copied.
   */
  async copy(
    sourceGroup: ServerGroupResolvable,
    options: { type: ServerGroupType; targetGroup: ServerGroupResolvable; name?: never },
  ): Promise<null>;

  async copy(
    sourceGroup: ServerGroupResolvable,
    options: {
      type: ServerGroupType;
      targetGroup?: ServerGroupResolvable | never;
      name?: string | never;
    },
  ): Promise<ServerGroup | null> {
    const sourceId = this.resolveId(sourceGroup);
    const targetId = options.targetGroup ? this.resolveId(options.targetGroup) : 0; // Teamspeak requires tsgid to be set to 0 when creating a new group.

    const data = await this.query.commands.servergroupcopy({
      ssgid: sourceId,
      tsgid: targetId,
      name: options.name ?? 'copy', // TeamSpeak requires a name when copying to a target group, even if its ignored.
      type: options.type,
    });

    if (options.targetGroup) {
      return null;
    } else {
      return this.query.actions.ServerGroupCreate.handle({
        sgid: data.sgid,
        name: options.name,
        type: options.type.toString(),
      }).serverGroup;
    }
  }
}
