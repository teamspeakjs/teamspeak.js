import { Collection } from '@discordjs/collection';
import { Query } from '../query';
import { CachedManager } from './cached-manager';
import { ChannelGroupResolvable, ChannelGroupType } from '../typings/types';
import { ChannelGroup } from '../structures/channel-group';
import { RawChannelGroup } from '../typings/teamspeak';

type ChannelGroupCreateOptions = {
  name: string;
  type?: ChannelGroupType;
};

export interface ChannelGroupCopyOptions {
  /**
   * The type of the new channel group.
   */
  type: ChannelGroupType;
}

export interface ChannelGroupCopyOptions_Create extends ChannelGroupCopyOptions {
  /**
   * The name of the new channel group.
   */
  name: string;

  targetGroup?: never;
}

export interface ChannelGroupCopyOptions_Target extends ChannelGroupCopyOptions {
  /**
   * The target channel group to copy to.
   */
  targetGroup: ChannelGroupResolvable;

  name?: never;
}

/**
 * Manages the channel groups in the TeamSpeak server.
 */
export class ChannelGroupManager extends CachedManager<ChannelGroup, RawChannelGroup> {
  constructor(query: Query) {
    super(query, ChannelGroup, 'cgid');
  }

  /**
   * Resolves a channel group ID.
   * @param {ChannelGroupResolvable} channelGroup The object to resolve.
   * @returns {number} The channel group ID.
   */
  resolveId(channelGroup: ChannelGroupResolvable): number {
    if (channelGroup instanceof ChannelGroup) return channelGroup.id;
    return channelGroup;
  }

  /**
   * Obtains all channel groups from TeamSpeak.
   * @returns {Promise<Collection<number, ChannelGroup>>} The channel groups.
   */
  async fetch(): Promise<Collection<number, ChannelGroup>> {
    const _data = await this.query.commands.channelgrouplist();
    const data = Array.isArray(_data) ? _data : [_data];

    const groups = new Collection<number, ChannelGroup>();

    for (const group of data) {
      groups.set(Number(group.cgid), this._add(group));
    }

    return groups;
  }

  /**
   * Creates a new channel group.
   * @param {ChannelGroupCreateOptions} options The options for creating the channel group.
   * @property {string} options.name The name of the channel group.
   * @property {ChannelGroupType} [options.type=1] The type of the channel group. Default is 1 (Regular).
   * @returns {Promise<ChannelGroup>} The created channel group.
   */
  async create(options: ChannelGroupCreateOptions): Promise<ChannelGroup> {
    const data = await this.query.commands.channelgroupadd(options);
    return this.query.actions.ChannelGroupCreate.handle({
      cgid: data.cgid,
      name: options.name,
      type: options.type ? options.type.toString() : undefined,
    }).channelGroup;
  }

  /**
   * Deletes a channel group.
   * @param {ChannelGroupResolvable} channelGroup The channel group to delete.
   * @param {boolean} [force=false] Whether to force the deletion. Force deletion will remove the channel group from all clients.
   * @returns {Promise<void>} A promise that resolves when the channel group has been deleted.
   */
  async delete(channelGroup: ChannelGroupResolvable, force: boolean = false): Promise<void> {
    const id = this.resolveId(channelGroup);
    await this.query.commands.channelgroupdel({ cgid: id, force });
    this.query.actions.ChannelGroupDelete.handle({ cgid: id.toString() });
  }

  /**
   * Renames a channel group.
   * @param {ChannelGroupResolvable} channelGroup The channel group to rename.
   * @param {string} name The new name for the channel group.
   * @returns {Promise<ChannelGroup>} The updated channel group.
   */
  async rename(channelGroup: ChannelGroupResolvable, name: string): Promise<ChannelGroup> {
    const id = this.resolveId(channelGroup);
    await this.query.commands.channelgrouprename({ cgid: id, name });
    return this.query.actions.ChannelGroupUpdate.handle({ cgid: id.toString(), name }).after!;
  }

  /**
   * Copies a channel group into a new channel group.
   *
   * @param {ChannelGroup} sourceGroup The source channel group to copy.
   * @param {ChannelGroupCopyOptions_Create} options The options for copying the channel group.
   * @returns {Promise<ChannelGroup>} The created channel group.
   */
  async copy(
    sourceGroup: ChannelGroupResolvable,
    options: ChannelGroupCopyOptions_Create,
  ): Promise<ChannelGroup>;

  /**
   * Copies a channel group into an existing channel group.
   *
   * @param {ChannelGroup} sourceGroup The source channel group to copy.
   * @param {ChannelGroupCopyOptions_Target} options The options for copying the channel group.
   * @returns {Promise<null>} A promise that resolves when the channel group has been copied.
   */
  async copy(
    sourceGroup: ChannelGroupResolvable,
    options: ChannelGroupCopyOptions_Target,
  ): Promise<null>;

  async copy(
    sourceGroup: ChannelGroupResolvable,
    options: ChannelGroupCopyOptions_Create | ChannelGroupCopyOptions_Target,
  ): Promise<ChannelGroup | null> {
    const sourceId = this.resolveId(sourceGroup);
    const targetId = options.targetGroup ? this.resolveId(options.targetGroup) : 0; // Teamspeak requires tcgid to be set to 0 when creating a new group.

    const data = await this.query.commands.channelgroupcopy({
      scgid: sourceId,
      tcgid: targetId,
      name: options.name ?? 'copy', // TeamSpeak requires a name when copying to a target group, even if its ignored.
      type: options.type,
    });

    if (options.targetGroup) {
      return null;
    } else {
      return this.query.actions.ChannelGroupCreate.handle({
        cgid: data.cgid,
        name: options.name,
        type: options.type.toString(),
      }).channelGroup;
    }
  }
}
