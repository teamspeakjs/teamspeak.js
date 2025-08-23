import Channel from '../structures/channel';
import Client from '../structures/client';

export type RawInstance = {
  serverinstance_database_version: string;
  serverinstance_filetransfer_port: string;
  serverinstance_max_download_total_bandwidth: string;
  serverinstance_max_upload_total_bandwidth: string;
  serverinstance_guest_serverquery_group: string;
  serverinstance_serverquery_flood_commands: string;
  serverinstance_serverquery_flood_time: string;
  serverinstance_serverquery_ban_time: string;
  serverinstance_template_serveradmin_group: string;
  serverinstance_template_serverdefault_group: string;
  serverinstance_template_channeladmin_group: string;
  serverinstance_template_channeldefault_group: string;
  serverinstance_permissions_version: string;
  serverinstance_pending_connections_per_ip: string;
  serverinstance_serverquery_max_connections_per_ip: string;
};

export type RawServerQueryInfo = {
  virtualserver_status: string;
  virtualserver_id: string;
  virtualserver_unique_identifier: string;
  virtualserver_port: string;
  client_id: string;
  client_channel_id: string;
  client_nickname: string;
  client_database_id: string;
  client_login_name: string;
  client_unique_identifier: string;
  client_origin_server_id: string;
};

export type RawChannel = {
  cid: string;
  pid: string;
  channel_name: string;
  channel_order: string;
  channel_topic: string;
  channel_description: string;
  channel_flag_permanent: string;
  channel_flag_semi_permanent: string;
  channel_flag_temporary: string;
  channel_flag_default: string;
};

export type RawClient = {
  clid: string;
  cid: string;
  client_database_id: string;
  client_nickname: string;
  client_type: string;
};

export type Constructable<Entity> = new (...args: any[]) => Entity;

export type ClientResolvable = Client | number;

export type ChannelResolvable = Channel | number;

export type EventTypes = {
  ChannelCreate: [channel: Channel];
  ChannelUpdate: [before: Channel, after: Channel];
  ChannelDelete: [channel: Channel];
};

export type RawVersion = {
  version: string;
  build: string;
  platform: string;
};

export type RawHostInfo = {
  instance_uptime: string;
  host_timestamp_utc: string;
  virtualservers_running_total: string;
  connection_filetransfer_bandwidth_sent: string;
};

export type RawCommandError = {
  id: number;
  msg: string;
  extra_msg?: string;
};
