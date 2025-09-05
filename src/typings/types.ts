import Ban from '../structures/ban';
import Channel from '../structures/channel';
import Client from '../structures/client';
import ServerGroup from '../structures/server-group';
import TextMessage from '../structures/text-message';
import VirtualServer from '../structures/virtual-server';

export type Constructable<Entity> = new (...args: any[]) => Entity;

export type ClientResolvable = Client | number;

export type ChannelResolvable = Channel | number;

export type ServerGroupResolvable = ServerGroup | number;

export type VirtualServerResolvable = VirtualServer | number;

export type BanResolvable = Ban | number;

export type If<Value extends boolean, TrueResult, FalseResult = null> = Value extends true
  ? TrueResult
  : Value extends false
    ? FalseResult
    : TrueResult | FalseResult;

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
};

export type BaseFetchOptions = {
  cache?: boolean;
  force?: boolean;
};
