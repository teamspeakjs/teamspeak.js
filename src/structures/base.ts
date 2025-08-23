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

  _patch(data: unknown) {
    return data;
  }

  _update(data: unknown) {
    const clone = this._clone();
    this._patch(data);
    return clone;
  }

  toJSON() {
    return JSON.stringify(this);
  }

  valueOf() {
    return this.id;
  }
}
