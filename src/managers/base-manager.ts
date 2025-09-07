import { Query } from '../query';

export abstract class BaseManager {
  protected query: Query;

  constructor(query: Query) {
    this.query = query;
  }
}
