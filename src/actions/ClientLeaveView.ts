import { Query } from '../query';
import Action from '../structures/action';
import Client from '../structures/client';
import { Events } from '../utils/events';

type Payload = {
  cfid: string;
  ctid: string;
  reasonid: string;
  reasonmsg: string;
  clid: string;
};

export default class ClientLeaveViewAction extends Action {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): { client: Client | null } {
    const client = this.query.clients.cache.get(Number(data.clid));
    if (client) {
      this.query.clients.cache.delete(client.id);
      this.query.emit(Events.ClientLeaveView, client);
      return {
        client,
      };
    }

    return {
      client: null,
    };
  }
}
