import { Query } from '../query';
import { Action } from '../structures/action';
import { PrivilegeKey } from '../structures/privilege-key';
import { Events } from '../utils/events';

type Payload = {
  token: string;
  tokentype: string;
  tokenid1: string;
  tokenid2: string;
  tokendescription: string;
  customset: string;
};

export class PrivilegeKeyCreateAction extends Action {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): { privilegeKey: PrivilegeKey } {
    const id = this.query.privilegeKeys.makeId(data);
    const existing = this.query.privilegeKeys.cache.get(id);
    const privilegeKey = this.query.privilegeKeys._add(data);
    if (!existing && privilegeKey) {
      this.query.emit(Events.PrivilegeKeyCreate, privilegeKey);
    }

    return {
      privilegeKey,
    };
  }
}
