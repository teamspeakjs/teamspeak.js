import { Query } from '../query';
import Action from '../structures/action';
import Ban from '../structures/ban';
import { Events } from '../utils/events';

type Payload = {
  banid: string;
};

export default class BanDeleteAction extends Action {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): { ban: Ban | null } {
    const ban = this.query.bans.cache.get(Number(data.banid));

    if (ban) {
      this.query.bans.cache.delete(ban.id);
      this.query.emit(Events.BanDelete, ban);
      return { ban };
    }

    return { ban: null };
  }
}
