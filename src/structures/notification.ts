import { Query } from '../query';

export class Notification {
  query: Query;

  constructor(query: Query) {
    this.query = query;
  }
}
