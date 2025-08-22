import { Query } from '../query';

export default abstract class BaseManager {
  protected query: Query;

  constructor(query: Query) {
    this.query = query;
  }
}
