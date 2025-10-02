import { Collection } from '@discordjs/collection';
import { Query } from '../query';
import { ServerGroup } from '../structures/server-group';
import { RawServerGroup } from '../typings/teamspeak';
import { CachedManager } from './cached-manager';
import {
  ClientResolvable,
  PermissionResolvable,
  ServerGroupResolvable,
  ServerGroupType,
} from '../typings/types';
import { Permission } from '../structures/permission';

interface ServerGroupCreateOptions {
  /**
   * The name of the server group.
   */
  name: string;

  /**
   * The type of the server group. Default is 1 (Regular).
   */
  type?: ServerGroupType;
}

export interface ServerGroupCopyOptions {
  /**
   * The type of the new server group.
   */
  type: ServerGroupType;
}

export interface ServerGroupCopyOptions_Create extends ServerGroupCopyOptions {
  /**
   * The name of the new server group.
   */
  name: string;

  targetGroup?: never;
}

export interface ServerGroupCopyOptions_Target extends ServerGroupCopyOptions {
  /**
   * The target server group to copy to.
   */
  targetGroup: ServerGroupResolvable;

  name?: never;
}

export interface ServerGroupAddPermissionOptions {
  /**
   * The permission to add or edit. This can be a permission object, a permission ID (number), or a permission server ID (string, such as "i_channel_modify_power").
   */
  permission: PermissionResolvable | string;

  /**
   * The value of the permission.
   */
  value: number;

  /**
   * Whether the permission is negated.
   */
  negated?: boolean;

  /**
   * Whether the permission is skipped.
   */
  skip?: boolean;
}

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
   * @param {ServerGroupCopyOptions_Create} options The options for copying the server group.
   * @returns {Promise<ServerGroup>} The created server group.
   */
  async copy(
    sourceGroup: ServerGroupResolvable,
    options: ServerGroupCopyOptions_Create,
  ): Promise<ServerGroup>;

  /**
   * Copies a server group into an existing server group.
   *
   * @param {ServerGroup} sourceGroup The source server group to copy.
   * @param {ServerGroupCopyOptions_Target} options The options for copying the server group.
   * @returns {Promise<null>} A promise that resolves when the server group has been copied.
   */
  async copy(
    sourceGroup: ServerGroupResolvable,
    options: ServerGroupCopyOptions_Target,
  ): Promise<null>;

  async copy(
    sourceGroup: ServerGroupResolvable,
    options: ServerGroupCopyOptions_Create | ServerGroupCopyOptions_Target,
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

  /**
   * Fetches the permissions from a server group.
   * @param {ServerGroupResolvable} serverGroup The server group to fetch the permissions from.
   * @returns {Promise<Collection<number, Permission>>} A promise that resolves with the permissions.
   */
  async fetchPermissions(
    serverGroup: ServerGroupResolvable,
  ): Promise<Collection<number, Permission>> {
    const id = this.resolveId(serverGroup);
    const _data = await this.query.commands.servergrouppermlist({ sgid: id });
    const data = Array.isArray(_data) ? _data : [_data];

    const collection = new Collection<number, Permission>();

    for (const permission of data) {
      collection.set(Number(permission.permid), this.query.permissions._add(permission));
    }

    return collection;
  }

  /**
   * Adds a permission to a server group. You can also edit the permission using this method.
   * @param {ServerGroupResolvable} serverGroup The server group to add the permission to.
   * @param {ServerGroupAddPermissionOptions} options The options for adding or editing the permission.
   * @returns {Promise<void>} A promise that resolves when the permission has been added or edited.
   */
  addPermission(
    serverGroup: ServerGroupResolvable,
    options: ServerGroupAddPermissionOptions,
  ): Promise<void> {
    const serverGroupId = this.resolveId(serverGroup);
    const permissionServerId =
      typeof options.permission === 'string' ? options.permission : undefined;
    const permissionId =
      typeof options.permission === 'string'
        ? undefined
        : this.query.permissions.resolveId(options.permission);

    return this.query.commands.servergroupaddperm({
      sgid: serverGroupId,
      permid: permissionId,
      permsid: permissionServerId,
      permvalue: options.value,
      permnegated: options.negated || false,
      permskip: options.skip || false,
    });
  }

  /**
   * Removes a permission from a server group.
   * @param {ServerGroupResolvable} serverGroup The server group to remove the permission from.
   * @param {PermissionResolvable | string} permission The permission to remove. This can be a permission object, a permission ID (number), or a permission server ID (string, such as "i_channel_modify_power").
   * @returns {Promise<void>} A promise that resolves when the permission has been removed.
   */
  removePermission(
    serverGroup: ServerGroupResolvable,
    permission: PermissionResolvable | string,
  ): Promise<void> {
    const serverGroupId = this.resolveId(serverGroup);
    const permissionServerId = typeof permission === 'string' ? permission : undefined;
    const permissionId =
      typeof permission === 'string' ? undefined : this.query.permissions.resolveId(permission);

    return this.query.commands.servergroupdelperm({
      sgid: serverGroupId,
      permid: permissionId,
      permsid: permissionServerId,
    });
  }
}
