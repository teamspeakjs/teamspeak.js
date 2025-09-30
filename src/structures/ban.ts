import { Query } from '../query';
import { RawBan } from '../typings/teamspeak';
import { Base } from './base';

/**
 * Represents a ban.
 */
export class Ban extends Base {
  ip: string | null = null;
  name: string | null = null;
  uniqueId: string | null = null;
  myTeamspeakId: string | null = null;
  lastNickname: string | null = null;
  createdTimestamp: number | null = null;
  duration: number | null = null;
  invokerName: string | null = null;
  invokerDatabaseId: number | null = null;
  invokerUid: string | null = null;
  reason: string | null = null;
  enforcements: number | null = null;

  constructor(query: Query, data: RawBan) {
    super(query, Number(data.banid));

    this._patch(data);
  }

  /**
   * Patches the ban with new data.
   * @param {Partial<RawBan>} data The new data to patch the ban with.
   */
  _patch(data: Partial<RawBan>): void {
    if ('ip' in data) {
      this.ip = data.ip!;
    }
    if ('name' in data) {
      this.name = data.name!;
    }
    if ('uid' in data) {
      this.uniqueId = data.uid!;
    }
    if ('mytsid' in data) {
      this.myTeamspeakId = data.mytsid!;
    }
    if ('lastnickname' in data) {
      this.lastNickname = data.lastnickname!;
    }
    if ('created' in data) {
      this.createdTimestamp = Number(data.created!);
    }
    if ('duration' in data) {
      this.duration = Number(data.duration!);
    }
    if ('invokername' in data) {
      this.invokerName = data.invokername!;
    }
    if ('invokercldbid' in data) {
      this.invokerDatabaseId = Number(data.invokercldbid!);
    }
    if ('invokeruid' in data) {
      this.invokerUid = data.invokeruid!;
    }
    if ('reason' in data) {
      this.reason = data.reason!;
    }
    if ('enforcements' in data) {
      this.enforcements = Number(data.enforcements!);
    }
  }

  get createdAt(): Date | null {
    return this.createdTimestamp ? new Date(this.createdTimestamp * 1000) : null;
  }

  /**
   * Deletes the ban.
   * @returns {Promise<void>} A promise that resolves when the ban has been deleted.
   */
  delete(): Promise<void> {
    return this.query.bans.delete(this);
  }
}
