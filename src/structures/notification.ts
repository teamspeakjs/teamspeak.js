import { Query } from '../query';

export default class Notification {
  query: Query;

  constructor(query: Query) {
    this.query = query;
  }
}
