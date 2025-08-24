import ChannelCreateAction from '../actions/ChannelCreate';
import ChannelDeleteAction from '../actions/ChannelDelete';
import ChannelUpdateAction from '../actions/ChannelUpdate';
import ClientEnterViewAction from '../actions/ClientEnterView';
import ClientLeaveViewAction from '../actions/ClientLeaveView';
import ClientMoveAction from '../actions/ClientMove';
import ClientUpdateAction from '../actions/ClientUpdate';
import ServerGroupCreateAction from '../actions/ServerGroupCreate';
import ServerGroupDeleteAction from '../actions/ServerGroupDelete';
import ServerGroupUpdateAction from '../actions/ServerGroupUpdate';
import { Query } from '../query';
import BaseManager from './base-manager';

export default class ActionManager extends BaseManager {
  // CHANNELS
  ChannelCreate: ChannelCreateAction;
  ChannelDelete: ChannelDeleteAction;
  ChannelUpdate: ChannelUpdateAction;

  //CLIENTS
  ClientEnterView: ClientEnterViewAction;
  ClientLeaveView: ClientLeaveViewAction;
  ClientUpdate: ClientUpdateAction;
  ClientMove: ClientMoveAction;

  ServerGroupCreate: ServerGroupCreateAction;
  ServerGroupDelete: ServerGroupDeleteAction;
  ServerGroupUpdate: ServerGroupUpdateAction;

  constructor(query: Query) {
    super(query);

    this.ChannelCreate = new ChannelCreateAction(query);
    this.ChannelDelete = new ChannelDeleteAction(query);
    this.ChannelUpdate = new ChannelUpdateAction(query);

    this.ClientEnterView = new ClientEnterViewAction(query);
    this.ClientLeaveView = new ClientLeaveViewAction(query);
    this.ClientUpdate = new ClientUpdateAction(query);
    this.ClientMove = new ClientMoveAction(query);

    this.ServerGroupCreate = new ServerGroupCreateAction(query);
    this.ServerGroupDelete = new ServerGroupDeleteAction(query);
    this.ServerGroupUpdate = new ServerGroupUpdateAction(query);
  }
}
