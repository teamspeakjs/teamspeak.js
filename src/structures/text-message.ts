import { Query } from '../query';
import { RawTextMessage } from '../typings/teamspeak';
import Base from './base';
import Client from './client';

type TextMessageMode = 'client' | 'channel' | 'server';

export default class TextMessage extends Base {
  mode: TextMessageMode | null = null;
  content: string | null = null;
  targetId: number | null = null;
  invokerId: number | null = null;
  invokerName: string | null = null;
  invokerUid: string | null = null;

  constructor(query: Query, data: Partial<RawTextMessage>) {
    super(query, 0); //TODO: Messages don't have IDs

    this._patch(data);
  }

  _patch(data: Partial<RawTextMessage>): void {
    if ('targetmode' in data) {
      switch (data.targetmode) {
        case '1':
          this.mode = 'client';
          break;
        case '2':
          this.mode = 'channel';
          break;
        case '3':
          this.mode = 'server';
          break;
      }
    }
    if ('msg' in data) {
      this.content = data.msg!;
    }
    if ('target' in data) {
      this.targetId = Number(data.target!);
    }
    if ('invokerid' in data) {
      this.invokerId = Number(data.invokerid!);
      if (!this.query.clients.cache.has(this.invokerId)) {
        this.query.clients._add({ clid: data.invokerid });
      }
    }
    if ('invokername' in data) {
      this.invokerName = data.invokername!;
    }
    if ('invokeruid' in data) {
      this.invokerUid = data.invokeruid!;
    }
  }

  get invoker(): Client {
    return this.query.clients.cache.get(this.invokerId!)!;
  }
}
