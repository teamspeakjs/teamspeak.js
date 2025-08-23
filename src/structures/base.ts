import { Query } from '../query';

export default abstract class Base {
  protected query: Query;
  id: number;

  constructor(query: Query, id: number) {
    this.query = query;
    this.id = id;
  }

  _clone(): this {
    return Object.assign(Object.create(this), this);
  }

  _patch(data: unknown): unknown {
    return data;
  }

  _update(data: unknown): this {
    const clone = this._clone();
    this._patch(data);
    return clone;
  }

  toJSON(): string {
    return JSON.stringify(this);
  }

  valueOf(): number {
    return this.id;
  }
}
