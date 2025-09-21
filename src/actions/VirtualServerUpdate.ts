import { Query } from '../query';
import { Action } from '../structures/action';
import { VirtualServer } from '../structures/virtual-server';
import { Events } from '../utils/events';

type Payload = {
  virtualserver_name: string;
  virtualserver_port: string;
  virtualserver_autostart: string;
};

export class VirtualServerUpdateAction extends Action {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): { before: VirtualServer | null; after: VirtualServer | null } {
    const server = this.query.virtualServers.current;
    if (server) {
      const before = server._update(data);
      this.query.emit(Events.VirtualServerUpdate, before, server);
      return { before, after: server };
    }

    return { before: null, after: null };
  }
}
