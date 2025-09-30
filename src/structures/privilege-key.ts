import { Query } from '../query';
import { RawPrivilegeKey } from '../typings/teamspeak';
import { Base } from './base';

/**
 * Represents a privilege key.
 */
export class PrivilegeKey extends Base {
  token: string | null = null;
  tokenType: number | null = null;
  tokenId1: number | null = null;
  tokenId2: number | null = null;
  createdTimestamp: number | null = null;
  description: string | null = null;
  customSet: string | null = null;

  constructor(query: Query, data: Partial<RawPrivilegeKey>) {
    super(query, query.privilegeKeys.makeId({ token: data.token! }));

    this._patch(data);
  }

  _patch(data: Partial<RawPrivilegeKey>): void {
    if ('token' in data) {
      this.token = data.token!;
    }
    if ('token_type' in data) {
      this.tokenType = Number(data.token_type!);
    }
    if ('token_id1' in data) {
      this.tokenId1 = Number(data.token_id1!);
    }
    if ('token_id2' in data) {
      this.tokenId2 = Number(data.token_id2!);
    }
    if ('token_created' in data) {
      this.createdTimestamp = Number(data.token_created!);
    }
    if ('token_description' in data) {
      this.description = data.token_description!;
    }
    if ('token_customset' in data) {
      this.customSet = data.token_customset!;
    }
  }

  get createdAt(): Date | null {
    return this.createdTimestamp ? new Date(this.createdTimestamp * 1000) : null;
  }

  /**
   * Deletes the privilege key.
   * @returns {Promise<void>} A promise that resolves when the privilege key is deleted.
   */
  delete(): Promise<void> {
    return this.query.privilegeKeys.delete(this);
  }
}
