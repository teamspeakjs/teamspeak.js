import { Query } from '../query';
import { RawClient } from '../typings/teamspeak';
import Client from './client';

export default class QueryClient extends Client {
  constructor(query: Query, data: RawClient) {
    super(query, data);
  }

  /**
   * Sets the nickname of the client.
   * @param {string} nickname The new nickname.
   * @returns {Promise<Client>} The updated client.
   */
  setNickname(nickname: string): Promise<Client> {
    return this.query.clients.edit(this, { nickname });
  }

  /**
   * This does not work on the QueryClient.
   */
  setDescription(_description: string): Promise<Client> {
    throw new Error('Query clients cannot set their own description');
  }

  /**
   * This does not work on the QueryClient.
   */
  setTalker(_isTalker: boolean): Promise<Client> {
    throw new Error('Query clients cannot set their own talker status');
  }
}
