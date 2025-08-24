import { Query } from '../query';
import { RawServerGroup } from '../typings/teamspeak';
import Base from './base';

export default class ServerGroup extends Base {
  name: string | null = null;
  type: number | null = null;
  iconId: number | null = null;
  saveDb: boolean | null = null;
  sortId: number | null = null;
  nameMode: number | null = null;
  modifyPower: number | null = null;
  memberAddPower: number | null = null;
  memberRemovePower: number | null = null;

  constructor(query: Query, data: RawServerGroup) {
    super(query, Number(data.sgid));

    this._patch(data);
  }

  _patch(data: Partial<RawServerGroup>): void {
    if ('name' in data) {
      this.name = data.name!;
    }
    if ('type' in data) {
      this.type = Number(data.type!);
    }
    if ('iconid' in data) {
      this.iconId = Number(data.iconid!);
    }
    if ('savedb' in data) {
      this.saveDb = data.savedb === '1';
    }
    if ('sortid' in data) {
      this.sortId = Number(data.sortid!);
    }
    if ('namemode' in data) {
      this.nameMode = Number(data.namemode!);
    }
    if ('n_modifyp' in data) {
      this.modifyPower = Number(data.n_modifyp!);
    }
    if ('n_member_addp' in data) {
      this.memberAddPower = Number(data.n_member_addp!);
    }
    if ('n_member_removep' in data) {
      this.memberRemovePower = Number(data.n_member_removep!);
    }
  }

  get partial(): boolean {
    return typeof this.name !== 'string' || typeof this.type !== 'number';
  }

  rename(name: string): Promise<ServerGroup> {
    return this.query.serverGroups.rename(this, name);
  }

  delete(force: boolean = false): Promise<void> {
    return this.query.serverGroups.delete(this, force);
  }
}
