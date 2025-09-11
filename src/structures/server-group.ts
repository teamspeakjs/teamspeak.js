import {
  ServerGroupCopyOptions_Create,
  ServerGroupCopyOptions_Target,
} from '../managers/server-group-manager';
import { Query } from '../query';
import { RawServerGroup } from '../typings/teamspeak';
import { ClientResolvable } from '../typings/types';
import { Base } from './base';

/**
 * Represents a server group.
 */
export class ServerGroup extends Base {
  name: string | null = null;
  type: number | null = null;
  iconId: number | null = null;
  saveDb: boolean | null = null;
  sortId: number | null = null;
  nameMode: number | null = null;
  modifyPower: number | null = null;
  memberAddPower: number | null = null;
  memberRemovePower: number | null = null;

  constructor(query: Query, data: RawServerGroup) {
    super(query, Number(data.sgid));

    this._patch(data);
  }

  /**
   * Patches the server group with new data.
   * @param {Partial<RawServerGroup>} data The new data to patch the server group with.
   */
  _patch(data: Partial<RawServerGroup>): void {
    if ('name' in data) {
      this.name = data.name!;
    }
    if ('type' in data) {
      this.type = Number(data.type!);
    }
    if ('iconid' in data) {
      this.iconId = Number(data.iconid!);
    }
    if ('savedb' in data) {
      this.saveDb = data.savedb === '1';
    }
    if ('sortid' in data) {
      this.sortId = Number(data.sortid!);
    }
    if ('namemode' in data) {
      this.nameMode = Number(data.namemode!);
    }
    if ('n_modifyp' in data) {
      this.modifyPower = Number(data.n_modifyp!);
    }
    if ('n_member_addp' in data) {
      this.memberAddPower = Number(data.n_member_addp!);
    }
    if ('n_member_removep' in data) {
      this.memberRemovePower = Number(data.n_member_removep!);
    }
  }

  /**
   * Checks if the server group is partially filled.
   * @returns {boolean} Whether the server group is partially filled.
   */
  get partial(): boolean {
    return typeof this.name !== 'string' || typeof this.type !== 'number';
  }

  /**
   * Deletes the server group.
   * @param {boolean} [force=false] Whether to force the deletion. Force deletion will remove the server group from all clients.
   * @returns {Promise<void>} A promise that resolves when the server group has been deleted.
   */
  delete(force: boolean = false): Promise<void> {
    return this.query.serverGroups.delete(this, force);
  }

  /**
   * Renames the server group.
   * @param {string} name The new name for the server group.
   * @returns {Promise<ServerGroup>} The updated server group.
   */
  rename(name: string): Promise<ServerGroup> {
    return this.query.serverGroups.rename(this, name);
  }

  /**
   * Adds a client to the server group.
   * @param {ClientResolvable} client The client to add.
   * @returns {Promise<void>} A promise that resolves when the client has been added.
   */
  addClient(client: ClientResolvable): Promise<void> {
    return this.query.serverGroups.addClient(this, client);
  }

  /**
   * Removes a client from the server group.
   * @param {ClientResolvable} client The client to remove.
   * @returns {Promise<void>} A promise that resolves when the client has been removed.
   */
  removeClient(client: ClientResolvable): Promise<void> {
    return this.query.serverGroups.removeClient(this, client);
  }

  /**
   * Fetches the client database IDs from this server group.
   * @returns {Promise<number[]>} A promise that resolves with the client database IDs.
   */
  fetchClientDatabaseIds(): Promise<number[]> {
    return this.query.serverGroups.fetchClientDatabaseIds(this);
  }

  /**
   * Copies this server group into a new server group.
   *
   * @param {ServerGroupCopyOptions_Create} options The options for copying the server group.
   * @returns {Promise<ServerGroup>} The created server group.
   */
  async copy(options: ServerGroupCopyOptions_Create): Promise<ServerGroup>;

  /**
   * Copies this server group into an existing server group.
   *
   * @param {ServerGroupCopyOptions_Target} options The options for copying the server group.
   * @returns {Promise<null>} A promise that resolves when the server group has been copied.
   */
  async copy(options: ServerGroupCopyOptions_Target): Promise<null>;

  async copy(
    options: ServerGroupCopyOptions_Create | ServerGroupCopyOptions_Target,
  ): Promise<ServerGroup | null> {
    if ('name' in options) {
      return this.query.serverGroups.copy(this, options as ServerGroupCopyOptions_Create);
    } else {
      return this.query.serverGroups.copy(this, options as ServerGroupCopyOptions_Target);
    }
  }
}
