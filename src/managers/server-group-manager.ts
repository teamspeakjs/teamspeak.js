import { Collection } from '@discordjs/collection';
import { Query } from '../query';
import ServerGroup from '../structures/server-group';
import { RawServerGroup } from '../typings/teamspeak';
import CachedManager from './cached-manager';
import { ClientResolvable, ServerGroupResolvable, ServerGroupType } from '../typings/types';

type ServerGroupCreateOptions = {
  name: string;
  type?: ServerGroupType;
};

/**
 * Manages the server groups in the TeamSpeak server.
 */
export default class ServerGroupManager extends CachedManager<ServerGroup, RawServerGroup> {
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
    return this.query.actions.ServerGroupCreate.handle({ sgid: data.sgid, ...options }).serverGroup;
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
}
