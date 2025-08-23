import { Query } from '../query';
import Action from '../structures/action';
import Client from '../structures/client';
import { RawClient } from '../typings/teamspeak';
import { Events } from '../utils/events';

type Payload = Omit<RawClient, 'cid'> & {
  cfid: string;
  ctid: string;
  reasonid: string;
};

//TODO: Add fromChannel and toChannel. First I have to figure out how the enterview and leftview notifications and the cfid and ctid are handled. Permissions?
export default class ClientEnterViewAction extends Action {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): { client: Client } {
    const existing = this.query.clients.cache.get(Number(data.clid));
    const client = this.query.clients._add({
      ...data,
      cid: data.ctid,
    });
    if (!existing && client) {
      this.query.emit(Events.ClientEnterView, client);
    }

    return {
      client,
    };
  }
}
