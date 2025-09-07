import { Query } from '../query';

export class Action {
  query: Query;

  constructor(query: Query) {
    this.query = query;
  }
}
