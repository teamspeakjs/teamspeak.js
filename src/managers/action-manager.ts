import { BanCreateAction } from '../actions/BanCreate';
import { BanDeleteAction } from '../actions/BanDelete';
import { ChannelCreateAction } from '../actions/ChannelCreate';
import { ChannelDeleteAction } from '../actions/ChannelDelete';
import { ChannelGroupCreateAction } from '../actions/ChannelGroupCreate';
import { ChannelGroupDeleteAction } from '../actions/ChannelGroupDelete';
import { ChannelGroupUpdateAction } from '../actions/ChannelGroupUpdate';
import { ChannelUpdateAction } from '../actions/ChannelUpdate';
import { ClientEnterViewAction } from '../actions/ClientEnterView';
import { ClientLeaveViewAction } from '../actions/ClientLeaveView';
import { ClientMoveAction } from '../actions/ClientMove';
import { ClientUpdateAction } from '../actions/ClientUpdate';
import { ServerGroupCreateAction } from '../actions/ServerGroupCreate';
import { ServerGroupDeleteAction } from '../actions/ServerGroupDelete';
import { ServerGroupUpdateAction } from '../actions/ServerGroupUpdate';
import { VirtualServerDeleteAction } from '../actions/VirtualServerDelete';
import { VirtualServerUpdateAction } from '../actions/VirtualServerUpdate';
import { Query } from '../query';
import { BaseManager } from './base-manager';

export class ActionManager extends BaseManager {
  // CHANNELS
  ChannelCreate: ChannelCreateAction;
  ChannelDelete: ChannelDeleteAction;
  ChannelUpdate: ChannelUpdateAction;

  //CLIENTS
  ClientEnterView: ClientEnterViewAction;
  ClientLeaveView: ClientLeaveViewAction;
  ClientUpdate: ClientUpdateAction;
  ClientMove: ClientMoveAction;

  // SERVER GROUPS
  ServerGroupCreate: ServerGroupCreateAction;
  ServerGroupDelete: ServerGroupDeleteAction;
  ServerGroupUpdate: ServerGroupUpdateAction;

  // BANS
  BanCreate: BanCreateAction;
  BanDelete: BanDeleteAction;

  // CHANNEL GROUPS
  ChannelGroupCreate: ChannelGroupCreateAction;
  ChannelGroupDelete: ChannelGroupDeleteAction;
  ChannelGroupUpdate: ChannelGroupUpdateAction;

  // VIRTUAL SERVERS
  VirtualServerUpdate: VirtualServerUpdateAction;
  VirtualServerDelete: VirtualServerDeleteAction;

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

    this.BanCreate = new BanCreateAction(query);
    this.BanDelete = new BanDeleteAction(query);

    this.ChannelGroupCreate = new ChannelGroupCreateAction(query);
    this.ChannelGroupDelete = new ChannelGroupDeleteAction(query);
    this.ChannelGroupUpdate = new ChannelGroupUpdateAction(query);

    this.VirtualServerUpdate = new VirtualServerUpdateAction(query);
    this.VirtualServerDelete = new VirtualServerDeleteAction(query);
  }
}
