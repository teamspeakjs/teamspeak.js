import { Query } from '../query';
import { RawClient } from '../typings/teamspeak';
import Client from './client';

export default class QueryClient extends Client {
  constructor(query: Query, data: RawClient) {
    super(query, data);
  }

  setNickname(nickname: string): Promise<Client> {
    return this.query.clients.edit(this, { nickname });
  }

  setDescription(_description: string): Promise<Client> {
    throw new Error('Query clients cannot set their own description');
  }

  setTalker(_isTalker: boolean): Promise<Client> {
    throw new Error('Query clients cannot set their own talker status');
  }
}
