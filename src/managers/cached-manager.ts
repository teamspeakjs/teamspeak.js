import { Collection } from '@discordjs/collection';
import { Query } from '../query';
import { Constructable } from '../typings/types';
import Base from '../structures/base';
import BaseManager from './base-manager';

export interface Structure<Holds, RawHolds> {
  id: number;
  _patch(data: RawHolds): void;
  _clone(): Holds;
}

export default abstract class CachedManager<Holds extends Base, RawHolds> extends BaseManager {
  holds: Constructable<Holds>;
  idKey: string;

  private _cache = new Collection<number, Holds>();

  constructor(query: Query, holds: Constructable<Holds>, idKey: string) {
    super(query);
    this.holds = holds;
    this.idKey = idKey;
  }

  get cache() {
    return this._cache;
  }

  _add(data: Partial<RawHolds>, cache = true, { id }: { id?: number } = {}): Holds {
    const existing = this.cache.get(Number((data as any)[this.idKey]!));
    if (existing) {
      if (cache) {
        existing._patch(data);
        return existing;
      }

      const clone = existing._clone();
      clone._patch(data);
      return clone;
    }

    const entry = new this.holds(this.query, data);
    if (cache) {
      this.cache.set(id ?? entry.id, entry);
    }
    return entry;
  }
}
