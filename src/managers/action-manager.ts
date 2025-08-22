import ChannelCreateAction from '../actions/ChannelCreate';
import ChannelDeleteAction from '../actions/ChannelDelete';
import ChannelUpdateAction from '../actions/ChannelUpdate';
import { Query } from '../query';
import BaseManager from './base-manager';

export default class ActionManager extends BaseManager {
  ChannelCreate: ChannelCreateAction;
  ChannelDelete: ChannelDeleteAction;
  ChannelUpdate: ChannelUpdateAction;

  constructor(query: Query) {
    super(query);

    this.ChannelCreate = new ChannelCreateAction(query);
    this.ChannelDelete = new ChannelDeleteAction(query);
    this.ChannelUpdate = new ChannelUpdateAction(query);
  }
}
