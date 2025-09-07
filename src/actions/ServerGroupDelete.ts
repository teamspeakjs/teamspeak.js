import { Query } from '../query';
import { Action } from '../structures/action';
import { ServerGroup } from '../structures/server-group';
import { Events } from '../utils/events';

type Payload = {
  sgid: string;
};

export class ServerGroupDeleteAction extends Action {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): { serverGroup: ServerGroup | null } {
    const serverGroup = this.query.serverGroups.cache.get(Number(data.sgid));

    if (serverGroup) {
      this.query.serverGroups.cache.delete(serverGroup.id);
      this.query.emit(Events.ServerGroupDelete, serverGroup);
      return { serverGroup };
    }

    return { serverGroup: null };
  }
}
