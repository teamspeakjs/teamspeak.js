import { Ban } from '../structures/ban';
import { Channel } from '../structures/channel';
import { ChannelGroup } from '../structures/channel-group';
import { Client } from '../structures/client';
import { Permission } from '../structures/permission';
import { ServerGroup } from '../structures/server-group';
import { TextMessage } from '../structures/text-message';
import { PrivilegeKey } from '../structures/privilege-key';
import { VirtualServer } from '../structures/virtual-server';

export type Constructable<Entity> = new (...args: any[]) => Entity;

/**
 * A client or a client ID.
 */
export type ClientResolvable = Client | number;

/**
 * A channel or a channel ID.
 */
export type ChannelResolvable = Channel | number;

/**
 * A server group or a server group ID.
 */
export type ServerGroupResolvable = ServerGroup | number;

/**
 * A virtual server or a virtual server ID.
 */
export type VirtualServerResolvable = VirtualServer | number;

/**
 * A ban or a ban ID.
 */
export type BanResolvable = Ban | number;

/**
 * A channel group or a channel group ID.
 */
export type ChannelGroupResolvable = ChannelGroup | number;

/**
 * A permission or a permission ID.
 */
export type PermissionResolvable = Permission | number;

/**
 * A privilege key or a privilege key ID.
 */
export type PrivilegeKeyResolvable = PrivilegeKey | number;

/**
 * The events of the TeamSpeak server.
 */
export type EventTypes = {
  /**
   * The event when the client is ready.
   */
  Ready: [];
  /**
   * The event when an error occurs. Includes the error.
   */
  Error: [error: unknown];
  /**
   * The event when the client is closed.
   */
  Close: [];
  /**
   * The event when a debug message is received. Includes the message.
   */
  Debug: [message: string];

  /**
   * The event when a channel is created. Includes the channel and the invoker.
   */
  ChannelCreate: [channel: Channel, invoker: Client];
  /**
   * The event when a channel is updated. Includes the before and after state of the channel and the invoker.
   */
  ChannelUpdate: [before: Channel, after: Channel, invoker: Client];
  /**
   * The event when a channel is deleted. Includes the channel and the invoker.
   */
  ChannelDelete: [channel: Channel, invoker: Client];

  /**
   * The event when a client enters a view. Includes the client.
   */
  ClientEnterView: [client: Client];
  /**
   * The event when a client leaves a view. Includes the client.
   */
  ClientLeaveView: [client: Client];
  /**
   * The event when a client is updated. Includes the before and after state of the client.
   */
  ClientUpdate: [before: Client, after: Client];
  /**
   * The event when a client moves. Includes the client, the old channel, the new channel and the invoker. The oldChannel can be null if the old channel is not known. Invoker is null, if the client moved on their own.
   */
  ClientMove: [
    client: Client,
    oldChannel: Channel | null,
    newChannel: Channel,
    invoker: Client | null,
  ];

  /**
   * The event when a text message is received. Includes the text message.
   */
  TextMessage: [textMessage: TextMessage];

  /**
   * The event when a server group is created. Includes the server group.
   */
  ServerGroupCreate: [serverGroup: ServerGroup];
  /**
   * The event when a server group is deleted. Includes the server group.
   */
  ServerGroupDelete: [serverGroup: ServerGroup];
  /**
   * The event when a server group is updated. Includes the before and after state of the server group.
   */
  ServerGroupUpdate: [before: ServerGroup, after: ServerGroup];

  /**
   * The event when a ban is created. Includes the ban.
   */
  BanCreate: [ban: Ban];
  /**
   * The event when a ban is deleted. Includes the ban.
   */
  BanDelete: [ban: Ban];

  /**
   * The event when a channel group is created. Includes the channel group.
   */
  ChannelGroupCreate: [channelGroup: ChannelGroup];
  /**
   * The event when a channel group is deleted. Includes the channel group.
   */
  ChannelGroupDelete: [channelGroup: ChannelGroup];
  /**
   * The event when a channel group is updated. Includes the before and after state of the channel group.
   */
  ChannelGroupUpdate: [before: ChannelGroup, after: ChannelGroup];

  /**
   * The event when a virtual server is created. Includes the virtual server.
   */
  VirtualServerCreate: [virtualServer: VirtualServer];
  /**
   * The event when a virtual server is updated. Includes the before and after state of the virtual server.
   */
  VirtualServerUpdate: [before: VirtualServer, after: VirtualServer];
  /**
   * The event when a virtual server is deleted. Includes the virtual server.
   */
  VirtualServerDelete: [virtualServer: VirtualServer];

  /**
   * The event when a privilege key is created. Includes the privilege key.
   */
  PrivilegeKeyCreate: [privilegeKey: PrivilegeKey];
  /**
   * The event when a privilege key is deleted. Includes the privilege key.
   */
  PrivilegeKeyDelete: [privilegeKey: PrivilegeKey];
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

export enum PrivilegeKeyType {
  ServerGroup = 0,
  ChannelGroup = 1,
}

export type ServerVersion = {
  version: string;
  build: number;
  platform: string;
};

export type HostInfo = {
  instanceUptime: number;
  hostTimestampUtc: Date;
  virtualServersRunningTotal: number;
  connectionFiletransferBandwidthSent: number;
  connectionFiletransferBandwidthReceived: number;
  connectionFiletransferBytesSentTotal: number;
  connectionFiletransferBytesReceivedTotal: number;
  connectionPacketsSentTotal: number;
  connectionBytesSentTotal: number;
  connectionPacketsReceivedTotal: number;
  connectionBytesReceivedTotal: number;
  connectionBandwidthSentLastSecondTotal: number;
  connectionBandwidthSentLastMinuteTotal: number;
  connectionBandwidthReceivedLastSecondTotal: number;
  connectionBandwidthReceivedLastMinuteTotal: number;
};
