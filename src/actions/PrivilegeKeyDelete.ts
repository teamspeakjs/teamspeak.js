import { Query } from '../query';
import { Action } from '../structures/action';
import { PrivilegeKey } from '../structures/privilege-key';
import { Events } from '../utils/events';

type Payload = {
  id: string;
};

export class PrivilegeKeyDeleteAction extends Action {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): { privilegeKey: PrivilegeKey | null } {
    const privilegeKey = this.query.privilegeKeys.cache.get(Number(data.id)) ?? null;

    if (privilegeKey) {
      this.query.privilegeKeys.cache.delete(Number(data.id));
      this.query.emit(Events.PrivilegeKeyDelete, privilegeKey);
      return { privilegeKey };
    }

    return { privilegeKey: null };
  }
}
