import { Query } from '../query';
import Action from '../structures/action';
import Client from '../structures/client';
import { Events } from '../utils/events';

type Payload = {
  clid: string;
  client_nickname: string;
  client_is_talker: string;
  client_description: string;
};

export default class ClientUpdateAction extends Action {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): { before: Client | null; after: Client | null } {
    const client = this.query.clients.cache.get(Number(data.clid));

    if (client) {
      const before = client._update(data);
      this.query.emit(Events.ClientUpdate, before, client);
      return { before, after: client };
    } else {
      this.query.clients._add(data);
    }

    return { before: null, after: null };
  }
}
