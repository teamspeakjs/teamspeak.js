import { Query } from '../query';
import { Action } from '../structures/action';
import { ServerGroup } from '../structures/server-group';
import { Events } from '../utils/events';

type Payload = {
  sgid: string;
  name: string;
};

export class ServerGroupUpdateAction extends Action {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): { before: ServerGroup | null; after: ServerGroup | null } {
    const serverGroup = this.query.serverGroups.cache.get(Number(data.sgid));
    if (serverGroup) {
      const before = serverGroup._update(data);
      this.query.emit(Events.ServerGroupUpdate, before, serverGroup);
      return { before, after: serverGroup };
    } else {
      this.query.serverGroups._add(data);
    }

    return { before: null, after: null };
  }
}
