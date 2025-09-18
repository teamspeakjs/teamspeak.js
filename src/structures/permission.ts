import { Query } from '../query';
import { RawPermission } from '../typings/teamspeak';
import { Base } from './base';

/**
 * Represents a permission.
 */
export class Permission extends Base {
  name: string | null = null;
  description: string | null = null;

  constructor(query: Query, data: Partial<RawPermission>) {
    super(query, Number(data.permid));

    this._patch(data);
  }

  /**
   * Patches the permission with new data.
   * @param {Partial<RawPermission>} data The new data to patch the permission with.
   */
  _patch(data: Partial<RawPermission>): void {
    if ('permname' in data) {
      this.name = data.permname!;
    }
    if ('permdesc' in data) {
      this.description = data.permdesc!;
    }
  }
}
