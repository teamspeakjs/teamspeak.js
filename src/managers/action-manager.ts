import ChannelCreateAction from '../actions/ChannelCreate';
import ChannelDeleteAction from '../actions/ChannelDelete';
import ChannelUpdateAction from '../actions/ChannelUpdate';
import ClientEnterViewAction from '../actions/ClientEnterView';
import { Query } from '../query';
import BaseManager from './base-manager';

export default class ActionManager extends BaseManager {
  // CHANNELS
  ChannelCreate: ChannelCreateAction;
  ChannelDelete: ChannelDeleteAction;
  ChannelUpdate: ChannelUpdateAction;

  //CLIENTS
  ClientEnterView: ClientEnterViewAction;

  constructor(query: Query) {
    super(query);

    this.ChannelCreate = new ChannelCreateAction(query);
    this.ChannelDelete = new ChannelDeleteAction(query);
    this.ChannelUpdate = new ChannelUpdateAction(query);

    this.ClientEnterView = new ClientEnterViewAction(query);
  }
}
