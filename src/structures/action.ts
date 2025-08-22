import { Query } from '../query';

export default class Action {
  query: Query;

  constructor(query: Query) {
    this.query = query;
  }
}
