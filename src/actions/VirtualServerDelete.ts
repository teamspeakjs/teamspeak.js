import { Query } from '../query';
import { Action } from '../structures/action';
import { VirtualServer } from '../structures/virtual-server';
import { Events } from '../utils/events';

type Payload = {
  sid: string;
};

export class VirtualServerDeleteAction extends Action {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): { virtualServer: VirtualServer | null } {
    const virtualServer = this.query.virtualServers.cache.get(Number(data.sid));

    if (virtualServer) {
      this.query.virtualServers.cache.delete(virtualServer.id);
      this.query.emit(Events.VirtualServerDelete, virtualServer);
      return { virtualServer };
    }

    return { virtualServer: null };
  }
}
