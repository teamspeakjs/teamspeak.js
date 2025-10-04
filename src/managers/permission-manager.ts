import { Collection } from '@discordjs/collection';
import { Query } from '../query';
import { CachedManager } from './cached-manager';
import { PermissionResolvable } from '../typings/types';
import { RawPermission } from '../typings/teamspeak';
import { Permission } from '../structures/permission';
import { CommandError } from '../errors/command-error';

/**
 * Manages the permissions in the TeamSpeak server.
 */
export class PermissionManager extends CachedManager<Permission, RawPermission> {
  constructor(query: Query) {
    super(query, Permission, 'permid');
  }

  /**
   * Resolves a permission ID.
   * @param {PermissionResolvable} permission The object to resolve.
   * @returns {number} The permission ID.
   */
  resolveId(permission: PermissionResolvable): number {
    if (permission instanceof Permission) return permission.id;
    return permission;
  }

  /**
   * Obtains all permissions from TeamSpeak.
   * @returns {Promise<Collection<number, Permission>>} The permissions.
   */
  async fetch(): Promise<Collection<number, Permission>> {
    const _data = await this.query.commands.permissionlist();
    const data = Array.isArray(_data) ? _data : [_data];

    const permissions = new Collection<number, Permission>();

    for (const permission of data) {
      permissions.set(Number(permission.permid), this._add(permission));
    }

    return permissions;
  }

  async fetchIdByName(name: string): Promise<number | null> {
    try {
      const { permid } = await this.query.commands.permidgetbyname({ permsid: name });
      return Number(permid);
    } catch (error) {
      if (error instanceof CommandError && error.id === 2562) {
        return null;
      }
      throw error;
    }
  }
}
