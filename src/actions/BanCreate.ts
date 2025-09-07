import { Query } from '../query';
import { Action } from '../structures/action';
import { Ban } from '../structures/ban';
import { Events } from '../utils/events';

type Payload = {
  banid: string;
};

export class BanCreateAction extends Action {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): { ban: Ban } {
    const existing = this.query.bans.cache.get(Number(data.banid));
    const ban = this.query.bans._add(data);
    if (!existing && ban) {
      this.query.emit(Events.BanCreate, ban);
    }

    return {
      ban,
    };
  }
}
