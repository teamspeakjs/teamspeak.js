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
    return this.query.actions.ChannelGroupCreate.handle({ cgid: data.cgid, ...options })
      .channelGroup;
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
}
