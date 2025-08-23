import Channel from '../structures/channel';
import Client from '../structures/client';

export type Constructable<Entity> = new (...args: any[]) => Entity;

export type ClientResolvable = Client | number;

export type ChannelResolvable = Channel | number;

export type EventTypes = {
  ChannelCreate: [channel: Channel];
  ChannelUpdate: [before: Channel, after: Channel];
  ChannelDelete: [channel: Channel];
};

export type RawCommandError = {
  id: number;
  msg: string;
  extra_msg?: string;
};

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
  connection_filetransfer_bandwidth_received: string;
  connection_filetransfer_bytes_sent_total: string;
  connection_filetransfer_bytes_received_total: string;
  connection_packets_sent_total: string;
  connection_bytes_sent_total: string;
  connection_packets_received_total: string;
  connection_bytes_received_total: string;
  connection_bandwidth_sent_last_second_total: string;
  connection_bandwidth_sent_last_minute_total: string;
  connection_bandwidth_received_last_second_total: string;
  connection_bandwidth_received_last_minute_total: string;
};

export type RawServerListItem = {
  virtualserver_id: string;
  virtualserver_port: string;
  virtualserver_status: string;
  virtualserver_clientsonline: string;
  virtualserver_queryclientsonline: string;
  virtualserver_maxclients: string;
  virtualserver_uptime: string;
  virtualserver_name: string;
  virtualserver_autostart: string;
  virtualserver_machine_id: string;
};

export type RawServer = {
  virtualserver_unique_identifier: string;
  virtualserver_name: string;
  virtualserver_welcomemessage: string;
  virtualserver_platform: string;
  virtualserver_version: string;
  virtualserver_maxclients: string;
  virtualserver_password: string;
  virtualserver_clientsonline: string;
  virtualserver_channelsonline: string;
  virtualserver_created: string;
  virtualserver_uptime: string;
  virtualserver_codec_encryption_mode: string;
  virtualserver_hostmessage: string;
  virtualserver_hostmessage_mode: string;
  virtualserver_filebase: string;
  virtualserver_default_server_group: string;
  virtualserver_default_channel_group: string;
  virtualserver_flag_password: string;
  virtualserver_default_channel_admin_group: string;
  virtualserver_max_download_total_bandwidth: string;
  virtualserver_max_upload_total_bandwidth: string;
  virtualserver_hostbanner_url: string;
  virtualserver_hostbanner_gfx_url: string;
  virtualserver_hostbanner_gfx_interval: string;
  virtualserver_complain_autoban_count: string;
  virtualserver_complain_autoban_time: string;
  virtualserver_complain_remove_time: string;
  virtualserver_min_clients_in_channel_before_forced_silence: string;
  virtualserver_priority_speaker_dimm_modificator: string;
  virtualserver_id: string;
  virtualserver_antiflood_points_tick_reduce: string;
  virtualserver_antiflood_points_needed_command_block: string;
  virtualserver_antiflood_points_needed_ip_block: string;
  virtualserver_client_connections: string;
  virtualserver_query_client_connections: string;
  virtualserver_hostbutton_tooltip: string;
  virtualserver_hostbutton_url: string;
  virtualserver_hostbutton_gfx_url: string;
  virtualserver_queryclientsonline: string;
  virtualserver_download_quota: string;
  virtualserver_upload_quota: string;
  virtualserver_month_bytes_downloaded: string;
  virtualserver_month_bytes_uploaded: string;
  virtualserver_total_bytes_downloaded: string;
  virtualserver_total_bytes_uploaded: string;
  virtualserver_port: string;
  virtualserver_autostart: string;
  virtualserver_machine_id: string;
  virtualserver_needed_identity_security_level: string;
  virtualserver_log_client: string;
  virtualserver_log_query: string;
  virtualserver_log_channel: string;
  virtualserver_log_permissions: string;
  virtualserver_log_server: string;
  virtualserver_log_filetransfer: string;
  virtualserver_min_client_version: string;
  virtualserver_name_phonetic: string;
  virtualserver_icon_id: string;
  virtualserver_reserved_slots: string;
  virtualserver_total_packetloss_speech: string;
  virtualserver_total_packetloss_keepalive: string;
  virtualserver_total_packetloss_control: string;
  virtualserver_total_packetloss_total: string;
  virtualserver_total_ping: string;
  virtualserver_ip: string;
  virtualserver_weblist_enabled: string;
  virtualserver_ask_for_privilegekey: string;
  virtualserver_hostbanner_mode: string;
  virtualserver_channel_temp_delete_delay_default: string;
  virtualserver_min_android_version: string;
  virtualserver_min_ios_version: string;
  virtualserver_nickname: string;
  virtualserver_antiflood_points_needed_plugin_block: string;
  virtualserver_capability_extensions: string;
  virtualserver_file_storage_class: string;
  virtualserver_status: string;
  connection_filetransfer_bandwidth_sent: string;
  connection_filetransfer_bandwidth_received: string;
  connection_filetransfer_bytes_sent_total: string;
  connection_filetransfer_bytes_received_total: string;
  connection_packets_sent_speech: string;
  connection_bytes_sent_speech: string;
  connection_packets_received_speech: string;
  connection_bytes_received_speech: string;
  connection_packets_sent_keepalive: string;
  connection_bytes_sent_keepalive: string;
  connection_packets_received_keepalive: string;
  connection_bytes_received_keepalive: string;
  connection_packets_sent_control: string;
  connection_bytes_sent_control: string;
  connection_packets_received_control: string;
  connection_bytes_received_control: string;
  connection_packets_sent_total: string;
  connection_bytes_sent_total: string;
  connection_packets_received_total: string;
  connection_bytes_received_total: string;
  connection_bandwidth_sent_last_second_total: string;
  connection_bandwidth_sent_last_minute_total: string;
  connection_bandwidth_received_last_second_total: string;
  connection_bandwidth_received_last_minute_total: string;
};
