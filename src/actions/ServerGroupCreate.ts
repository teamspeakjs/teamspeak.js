import { Query } from '../query';
import Action from '../structures/action';
import ServerGroup from '../structures/server-group';
import { Events } from '../utils/events';

type Payload = {
  sgid: string;
  name: string;
};

export default class ServerGroupCreateAction extends Action {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): { serverGroup: ServerGroup } {
    const existing = this.query.serverGroups.cache.get(Number(data.sgid));
    const serverGroup = this.query.serverGroups._add(data);
    if (!existing && serverGroup) {
      this.query.emit(Events.ServerGroupCreate, serverGroup);
    }

    return {
      serverGroup,
    };
  }
}
