import {
  ChannelGroupCopyOptions_Create,
  ChannelGroupCopyOptions_Target,
} from '../managers/channel-group-manager';
import { Query } from '../query';
import { RawChannelGroup } from '../typings/teamspeak';
import { Base } from './base';

/**
 * Represents a channel group.
 */
export class ChannelGroup extends Base {
  name: string | null = null;
  type: number | null = null;
  iconId: number | null = null;
  saveDb: boolean | null = null;
  sortId: number | null = null;
  nameMode: number | null = null;
  modifyPower: number | null = null;
  memberAddPower: number | null = null;
  memberRemovePower: number | null = null;

  constructor(query: Query, data: RawChannelGroup) {
    super(query, Number(data.cgid));

    this._patch(data);
  }

  /**
   * Patches the channel group with new data.
   * @param {Partial<RawChannelGroup>} data The new data to patch the channel group with.
   */
  _patch(data: Partial<RawChannelGroup>): void {
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
   * Checks if the channel group is partially filled.
   * @returns {boolean} Whether the channel group is partially filled.
   */
  get partial(): boolean {
    return typeof this.name !== 'string' || typeof this.type !== 'number';
  }

  /**
   * Deletes the channel group.
   * @param {boolean} [force=false] Whether to force the deletion. Force deletion will remove the channel group from all clients.
   * @returns {Promise<void>} A promise that resolves when the channel group has been deleted.
   */
  delete(force: boolean = false): Promise<void> {
    return this.query.channelGroups.delete(this, force);
  }

  /**
   * Renames the channel group.
   * @param {string} name The new name for the channel group.
   * @returns {Promise<ChannelGroup>} The updated channel group.
   */
  rename(name: string): Promise<ChannelGroup> {
    return this.query.channelGroups.rename(this, name);
  }

  /**
   * Copies this channel group into a new channel group.
   *
   * @param {ChannelGroupCopyOptions_Create} options The options for copying the channel group.
   * @returns {Promise<ChannelGroup>} The created channel group.
   */
  async copy(options: ChannelGroupCopyOptions_Create): Promise<ChannelGroup>;

  /**
   * Copies this channel group into an existing channel group.
   *
   * @param {ChannelGroupCopyOptions_Target} options The options for copying the channel group.
   * @returns {Promise<null>} A promise that resolves when the channel group has been copied.
   */
  async copy(options: ChannelGroupCopyOptions_Target): Promise<null>;

  async copy(
    options: ChannelGroupCopyOptions_Create | ChannelGroupCopyOptions_Target,
  ): Promise<ChannelGroup | null> {
    if ('name' in options) {
      return this.query.channelGroups.copy(this, options as ChannelGroupCopyOptions_Create);
    } else {
      return this.query.channelGroups.copy(this, options as ChannelGroupCopyOptions_Target);
    }
  }
}
