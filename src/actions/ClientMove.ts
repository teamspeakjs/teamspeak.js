import { Query } from '../query';
import { Action } from '../structures/action';
import { Channel } from '../structures/channel';
import { Client } from '../structures/client';
import { Events } from '../utils/events';

type Payload = {
  ctid: string;
  reasonid: string;
  invokerid?: string;
  invokername?: string;
  invokeruid?: string;
  clid: string;
};

export class ClientMoveAction extends Action {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): {
    client: Client | null;
    oldChannel: Channel | null;
    newChannel: Channel | null;
    invoker: Client | null;
  } {
    const client =
      Number(data.clid) === this.query.client.id
        ? this.query.client
        : this.query.clients.cache.get(Number(data.clid));
    if (client) {
      const oldChannel = client.channel;
      const newChannel = this.query.channels._add({ cid: data.ctid });
      const invoker = data.invokerid
        ? this.query.clients._add({
            clid: data.invokerid,
            client_nickname: data.invokername,
            client_unique_identifier: data.invokeruid,
          })
        : null;

      client._update({
        cid: newChannel.id.toString(),
      });
      this.query.emit(Events.ClientMove, client, oldChannel, newChannel, invoker);

      return {
        client,
        oldChannel,
        newChannel,
        invoker,
      };
    } else {
      this.query.clients._add({ clid: data.clid, cid: data.ctid });
    }

    return {
      client: null,
      oldChannel: null,
      newChannel: null,
      invoker: null,
    };
  }
}
