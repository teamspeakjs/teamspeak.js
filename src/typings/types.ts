import { Ban } from '../structures/ban';
import { Channel } from '../structures/channel';
import { ChannelGroup } from '../structures/channel-group';
import { Client } from '../structures/client';
import { ServerGroup } from '../structures/server-group';
import { TextMessage } from '../structures/text-message';
import { VirtualServer } from '../structures/virtual-server';

export type Constructable<Entity> = new (...args: any[]) => Entity;

export type ClientResolvable = Client | number;

export type ChannelResolvable = Channel | number;

export type ServerGroupResolvable = ServerGroup | number;

export type VirtualServerResolvable = VirtualServer | number;

export type BanResolvable = Ban | number;

export type ChannelGroupResolvable = ChannelGroup | number;

export type EventTypes = {
  Ready: [];
  Error: [error: unknown];
  Close: [];
  Debug: [message: string];

  ChannelCreate: [channel: Channel, invoker: Client];
  ChannelUpdate: [before: Channel, after: Channel, invoker: Client];
  ChannelDelete: [channel: Channel, invoker: Client];

  ClientEnterView: [client: Client];
  ClientLeaveView: [client: Client];
  ClientUpdate: [before: Client, after: Client];
  ClientMove: [
    client: Client,
    oldChannel: Channel | null,
    newChannel: Channel,
    invoker: Client | null,
  ];

  TextMessage: [textMessage: TextMessage];

  ServerGroupCreate: [serverGroup: ServerGroup];
  ServerGroupDelete: [serverGroup: ServerGroup];
  ServerGroupUpdate: [before: ServerGroup, after: ServerGroup];

  BanCreate: [ban: Ban];
  BanDelete: [ban: Ban];

  ChannelGroupCreate: [channelGroup: ChannelGroup];
  ChannelGroupDelete: [channelGroup: ChannelGroup];
  ChannelGroupUpdate: [before: ChannelGroup, after: ChannelGroup];

  VirtualServerDelete: [virtualServer: VirtualServer];
};

export type BaseFetchOptions = {
  cache?: boolean;
  force?: boolean;
};

export enum ServerGroupType {
  Template,
  Regular,
  Query,
}

export enum ChannelGroupType {
  Template,
  Regular,
  Query,
}
