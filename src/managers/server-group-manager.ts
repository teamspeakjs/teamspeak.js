import { Collection } from '@discordjs/collection';
import { Query } from '../query';
import ServerGroup from '../structures/server-group';
import { RawServerGroup } from '../typings/teamspeak';
import CachedManager from './cached-manager';
import { ServerGroupResolvable } from '../typings/types';

export default class ServerGroupManager extends CachedManager<ServerGroup, RawServerGroup> {
  constructor(query: Query) {
    super(query, ServerGroup, 'sgid');
  }

  resolveId(serverGroup: ServerGroupResolvable): number {
    if (serverGroup instanceof ServerGroup) return serverGroup.id;
    return serverGroup;
  }

  async fetch(): Promise<Collection<number, ServerGroup>> {
    const _data = await this.query.commands.servergrouplist();
    const data = Array.isArray(_data) ? _data : [_data];

    const groups = new Collection<number, ServerGroup>();

    for (const group of data) {
      groups.set(Number(group.sgid), this._add(group));
    }

    return groups;
  }

  async create(name: string): Promise<ServerGroup> {
    const data = await this.query.commands.servergroupadd({ name });
    return this.query.actions.ServerGroupCreate.handle({ sgid: data.sgid, name }).serverGroup;
  }

  async rename(serverGroup: ServerGroupResolvable, name: string): Promise<ServerGroup> {
    const id = this.resolveId(serverGroup);
    await this.query.commands.servergrouprename({ sgid: id, name });
    return this.query.actions.ServerGroupUpdate.handle({ sgid: id.toString(), name }).after!;
  }

  async delete(serverGroup: ServerGroupResolvable, force: boolean = false): Promise<void> {
    const id = this.resolveId(serverGroup);
    await this.query.commands.servergroupdel({ sgid: id, force });
    this.query.actions.ServerGroupDelete.handle({ sgid: id.toString() });
  }
}
