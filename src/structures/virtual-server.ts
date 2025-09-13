import { Query } from '../query';
import { RawVirtualServer } from '../typings/teamspeak';
import { Base } from './base';

/**
 * Represents a virtual server.
 */
export class VirtualServer extends Base {
  uniqueId: string | null = null;
  name: string | null = null;
  welcomeMessage: string | null = null;
  platform: string | null = null;
  version: string | null = null;
  maxClients: number | null = null;
  password: string | null = null;
  clientsOnline: number | null = null;
  channelsOnline: number | null = null;
  createdAt: Date | null = null;
  uptime: number | null = null;
  codecEncryptionMode: string | null = null;
  hostMessage: string | null = null;
  hostMessageMode: string | null = null;
  filebase: string | null = null;
  defaultServerGroup: number | null = null;
  defaultChannelGroup: number | null = null;
  defaultChannelAdminGroup: number | null = null;
  maxDownloadTotalBandwidth: number | null = null;
  maxUploadTotalBandwidth: number | null = null;
  hostBannerUrl: string | null = null;
  hostBannerGfxUrl: string | null = null;
  hostBannerGfxInterval: number | null = null;
  complainAutobanCount: number | null = null;
  complainAutobanTime: number | null = null;
  complainRemoveTime: number | null = null;
  minClientsInChannelBeforeForcedSilence: number | null = null;
  prioritySpeakerDimmModificator: number | null = null;
  antiFloodPointsTickReduce: number | null = null;
  antiFloodPointsNeededCommandBlock: number | null = null;
  antiFloodPointsNeededIpBlock: number | null = null;
  clientConnections: number | null = null;
  queryClientConnections: number | null = null;
  hostButtonTooltip: string | null = null;
  hostButtonUrl: string | null = null;
  hostButtonGfxUrl: string | null = null;
  queryClientsOnline: number | null = null;
  downloadQuota: number | null = null;
  uploadQuota: number | null = null;
  monthBytesDownloaded: number | null = null;
  monthBytesUploaded: number | null = null;
  totalBytesDownloaded: number | null = null;
  totalBytesUploaded: number | null = null;
  port: number | null = null;
  autoStart: boolean | null = null;
  machineId: string | null = null;
  neededIdentitySecurityLevel: number | null = null;
  logClient: boolean | null = null;
  logQuery: boolean | null = null;
  logChannel: boolean | null = null;
  logPermissions: boolean | null = null;
  logServer: boolean | null = null;
  logFileTransfer: boolean | null = null;
  minClientVersion: number | null = null;
  namePhonetic: string | null = null;
  iconId: number | null = null;
  reservedSlots: number | null = null;
  totalPacketLossSpeech: number | null = null;
  totalPacketLossKeepAlive: number | null = null;
  totalPacketLossControl: number | null = null;
  totalPacketLossTotal: number | null = null;
  totalPing: number | null = null;
  ip: string | null = null;
  webListEnabled: boolean | null = null;
  askForPrivilegeKey: boolean | null = null;
  hostBannerMode: string | null = null;
  channelTempDeleteDelayDefault: number | null = null;
  minAndroidVersion: number | null = null;
  minIosVersion: number | null = null;
  nickname: string | null = null;
  antiFloodPointsNeededPluginBlock: number | null = null;
  capabilityExtensions: string | null = null;
  fileStorageClass: string | null = null;
  status: string | null = null;
  connectionFileTransferBandwidthSent: number | null = null;
  connectionFileTransferBandwidthReceived: number | null = null;
  connectionFileTransferBytesSentTotal: number | null = null;
  connectionFileTransferBytesReceivedTotal: number | null = null;
  connectionPacketsSentSpeech: number | null = null;
  connectionBytesSentSpeech: number | null = null;
  connectionPacketsReceivedSpeech: number | null = null;
  connectionBytesReceivedSpeech: number | null = null;
  connectionPacketsSentKeepAlive: number | null = null;
  connectionBytesSentKeepAlive: number | null = null;
  connectionPacketsReceivedKeepAlive: number | null = null;
  connectionBytesReceivedKeepAlive: number | null = null;
  connectionPacketsSentControl: number | null = null;
  connectionBytesSentControl: number | null = null;
  connectionPacketsReceivedControl: number | null = null;
  connectionBytesReceivedControl: number | null = null;
  connectionPacketsSentTotal: number | null = null;
  connectionBytesSentTotal: number | null = null;
  connectionPacketsReceivedTotal: number | null = null;
  connectionBytesReceivedTotal: number | null = null;
  connectionBandwidthSentLastSecondTotal: number | null = null;
  connectionBandwidthSentLastMinuteTotal: number | null = null;
  connectionBandwidthReceivedLastSecondTotal: number | null = null;
  connectionBandwidthReceivedLastMinuteTotal: number | null = null;

  constructor(query: Query, data: RawVirtualServer) {
    super(query, Number(data.virtualserver_id));

    this._patch(data);
  }

  _patch(data: Partial<RawVirtualServer>): void {
    if ('virtualserver_unique_identifier' in data) {
      this.uniqueId = data.virtualserver_unique_identifier!;
    }
    if ('virtualserver_name' in data) {
      this.name = data.virtualserver_name!;
    }
    if ('virtualserver_welcomemessage' in data) {
      this.welcomeMessage = data.virtualserver_welcomemessage!;
    }
    if ('virtualserver_platform' in data) {
      this.platform = data.virtualserver_platform!;
    }
    if ('virtualserver_version' in data) {
      this.version = data.virtualserver_version!;
    }
    if ('virtualserver_maxclients' in data) {
      this.maxClients = Number(data.virtualserver_maxclients!);
    }
    if ('virtualserver_password' in data) {
      this.password = data.virtualserver_password!;
    }
    if ('virtualserver_clientsonline' in data) {
      this.clientsOnline = Number(data.virtualserver_clientsonline!);
    }
    if ('virtualserver_channelsonline' in data) {
      this.channelsOnline = Number(data.virtualserver_channelsonline!);
    }
    if ('virtualserver_created' in data) {
      this.createdAt = new Date(Number(data.virtualserver_created!) * 1000);
    }
    if ('virtualserver_uptime' in data) {
      this.uptime = Number(data.virtualserver_uptime!);
    }
    if ('virtualserver_codec_encryption_mode' in data) {
      this.codecEncryptionMode = data.virtualserver_codec_encryption_mode!;
    }
    if ('virtualserver_hostmessage' in data) {
      this.hostMessage = data.virtualserver_hostmessage!;
    }
    if ('virtualserver_hostmessage_mode' in data) {
      this.hostMessageMode = data.virtualserver_hostmessage_mode!;
    }
    if ('virtualserver_filebase' in data) {
      this.filebase = data.virtualserver_filebase!;
    }
    if ('virtualserver_default_server_group' in data) {
      this.defaultServerGroup = Number(data.virtualserver_default_server_group!);
    }
    if ('virtualserver_default_channel_group' in data) {
      this.defaultChannelGroup = Number(data.virtualserver_default_channel_group!);
    }
    if ('virtualserver_default_channel_admin_group' in data) {
      this.defaultChannelAdminGroup = Number(data.virtualserver_default_channel_admin_group!);
    }
    if ('virtualserver_max_download_total_bandwidth' in data) {
      this.maxDownloadTotalBandwidth = Number(data.virtualserver_max_download_total_bandwidth!);
    }
    if ('virtualserver_max_upload_total_bandwidth' in data) {
      this.maxUploadTotalBandwidth = Number(data.virtualserver_max_upload_total_bandwidth!);
    }
    if ('virtualserver_hostbanner_url' in data) {
      this.hostBannerUrl = data.virtualserver_hostbanner_url!;
    }
    if ('virtualserver_hostbanner_gfx_url' in data) {
      this.hostBannerGfxUrl = data.virtualserver_hostbanner_gfx_url!;
    }
    if ('virtualserver_hostbanner_gfx_interval' in data) {
      this.hostBannerGfxInterval = Number(data.virtualserver_hostbanner_gfx_interval!);
    }
    if ('virtualserver_complain_autoban_count' in data) {
      this.complainAutobanCount = Number(data.virtualserver_complain_autoban_count!);
    }
    if ('virtualserver_complain_autoban_time' in data) {
      this.complainAutobanTime = Number(data.virtualserver_complain_autoban_time!);
    }
    if ('virtualserver_complain_remove_time' in data) {
      this.complainRemoveTime = Number(data.virtualserver_complain_remove_time!);
    }
    if ('virtualserver_min_clients_in_channel_before_forced_silence' in data) {
      this.minClientsInChannelBeforeForcedSilence = Number(
        data.virtualserver_min_clients_in_channel_before_forced_silence!,
      );
    }
    if ('virtualserver_priority_speaker_dimm_modificator' in data) {
      this.prioritySpeakerDimmModificator = Number(
        data.virtualserver_priority_speaker_dimm_modificator!,
      );
    }
    if ('virtualserver_antiflood_points_tick_reduce' in data) {
      this.antiFloodPointsTickReduce = Number(data.virtualserver_antiflood_points_tick_reduce!);
    }
    if ('virtualserver_antiflood_points_needed_command_block' in data) {
      this.antiFloodPointsNeededCommandBlock = Number(
        data.virtualserver_antiflood_points_needed_command_block!,
      );
    }
    if ('virtualserver_antiflood_points_needed_ip_block' in data) {
      this.antiFloodPointsNeededIpBlock = Number(
        data.virtualserver_antiflood_points_needed_ip_block!,
      );
    }
    if ('virtualserver_client_connections' in data) {
      this.clientConnections = Number(data.virtualserver_client_connections!);
    }
    if ('virtualserver_query_client_connections' in data) {
      this.queryClientConnections = Number(data.virtualserver_query_client_connections!);
    }
    if ('virtualserver_hostbutton_tooltip' in data) {
      this.hostButtonTooltip = data.virtualserver_hostbutton_tooltip!;
    }
    if ('virtualserver_hostbutton_url' in data) {
      this.hostButtonUrl = data.virtualserver_hostbutton_url!;
    }
    if ('virtualserver_hostbutton_gfx_url' in data) {
      this.hostButtonGfxUrl = data.virtualserver_hostbutton_gfx_url!;
    }
    if ('virtualserver_queryclientsonline' in data) {
      this.queryClientsOnline = Number(data.virtualserver_queryclientsonline!);
    }
    if ('virtualserver_download_quota' in data) {
      this.downloadQuota = Number(data.virtualserver_download_quota!);
    }
    if ('virtualserver_upload_quota' in data) {
      this.uploadQuota = Number(data.virtualserver_upload_quota!);
    }
    if ('virtualserver_month_bytes_downloaded' in data) {
      this.monthBytesDownloaded = Number(data.virtualserver_month_bytes_downloaded!);
    }
    if ('virtualserver_month_bytes_uploaded' in data) {
      this.monthBytesUploaded = Number(data.virtualserver_month_bytes_uploaded!);
    }
    if ('virtualserver_total_bytes_downloaded' in data) {
      this.totalBytesDownloaded = Number(data.virtualserver_total_bytes_downloaded!);
    }
    if ('virtualserver_total_bytes_uploaded' in data) {
      this.totalBytesUploaded = Number(data.virtualserver_total_bytes_uploaded!);
    }
    if ('virtualserver_port' in data) {
      this.port = Number(data.virtualserver_port!);
    }
    if ('virtualserver_autostart' in data) {
      this.autoStart = data.virtualserver_autostart === '1';
    }
    if ('virtualserver_machine_id' in data) {
      this.machineId = data.virtualserver_machine_id!;
    }
    if ('virtualserver_needed_identity_security_level' in data) {
      this.neededIdentitySecurityLevel = Number(data.virtualserver_needed_identity_security_level!);
    }
    if ('virtualserver_log_client' in data) {
      this.logClient = data.virtualserver_log_client === '1';
    }
    if ('virtualserver_log_query' in data) {
      this.logQuery = data.virtualserver_log_query === '1';
    }
    if ('virtualserver_log_channel' in data) {
      this.logChannel = data.virtualserver_log_channel === '1';
    }
    if ('virtualserver_log_permissions' in data) {
      this.logPermissions = data.virtualserver_log_permissions === '1';
    }
    if ('virtualserver_log_server' in data) {
      this.logServer = data.virtualserver_log_server === '1';
    }
    if ('virtualserver_log_filetransfer' in data) {
      this.logFileTransfer = data.virtualserver_log_filetransfer === '1';
    }
    if ('virtualserver_min_client_version' in data) {
      this.minClientVersion = Number(data.virtualserver_min_client_version!);
    }
    if ('virtualserver_name_phonetic' in data) {
      this.namePhonetic = data.virtualserver_name_phonetic!;
    }
    if ('virtualserver_icon_id' in data) {
      this.iconId = Number(data.virtualserver_icon_id!);
    }
    if ('virtualserver_reserved_slots' in data) {
      this.reservedSlots = Number(data.virtualserver_reserved_slots!);
    }
    if ('virtualserver_total_packetloss_speech' in data) {
      this.totalPacketLossSpeech = Number(data.virtualserver_total_packetloss_speech!);
    }
    if ('virtualserver_total_packetloss_keepalive' in data) {
      this.totalPacketLossKeepAlive = Number(data.virtualserver_total_packetloss_keepalive!);
    }
    if ('virtualserver_total_packetloss_control' in data) {
      this.totalPacketLossControl = Number(data.virtualserver_total_packetloss_control!);
    }
    if ('virtualserver_total_packetloss_total' in data) {
      this.totalPacketLossTotal = Number(data.virtualserver_total_packetloss_total!);
    }
    if ('virtualserver_total_ping' in data) {
      this.totalPing = Number(data.virtualserver_total_ping!);
    }
    if ('virtualserver_ip' in data) {
      this.ip = data.virtualserver_ip!;
    }
    if ('virtualserver_weblist_enabled' in data) {
      this.webListEnabled = data.virtualserver_weblist_enabled === '1';
    }
    if ('virtualserver_ask_for_privilegekey' in data) {
      this.askForPrivilegeKey = data.virtualserver_ask_for_privilegekey === '1';
    }
    if ('virtualserver_hostbanner_mode' in data) {
      this.hostBannerMode = data.virtualserver_hostbanner_mode!;
    }
    if ('virtualserver_channel_temp_delete_delay_default' in data) {
      this.channelTempDeleteDelayDefault = Number(
        data.virtualserver_channel_temp_delete_delay_default!,
      );
    }
    if ('virtualserver_min_android_version' in data) {
      this.minAndroidVersion = Number(data.virtualserver_min_android_version!);
    }
    if ('virtualserver_min_ios_version' in data) {
      this.minIosVersion = Number(data.virtualserver_min_ios_version!);
    }
    if ('virtualserver_nickname' in data) {
      this.nickname = data.virtualserver_nickname!;
    }
    if ('virtualserver_antiflood_points_needed_plugin_block' in data) {
      this.antiFloodPointsNeededPluginBlock = Number(
        data.virtualserver_antiflood_points_needed_plugin_block!,
      );
    }
    if ('virtualserver_capability_extensions' in data) {
      this.capabilityExtensions = data.virtualserver_capability_extensions!;
    }
    if ('virtualserver_file_storage_class' in data) {
      this.fileStorageClass = data.virtualserver_file_storage_class!;
    }
    if ('virtualserver_status' in data) {
      this.status = data.virtualserver_status!;
    }
    if ('connection_filetransfer_bandwidth_sent' in data) {
      this.connectionFileTransferBandwidthSent = Number(
        data.connection_filetransfer_bandwidth_sent!,
      );
    }
    if ('connection_filetransfer_bandwidth_received' in data) {
      this.connectionFileTransferBandwidthReceived = Number(
        data.connection_filetransfer_bandwidth_received!,
      );
    }
    if ('connection_filetransfer_bytes_sent_total' in data) {
      this.connectionFileTransferBytesSentTotal = Number(
        data.connection_filetransfer_bytes_sent_total!,
      );
    }
    if ('connection_filetransfer_bytes_received_total' in data) {
      this.connectionFileTransferBytesReceivedTotal = Number(
        data.connection_filetransfer_bytes_received_total!,
      );
    }
    if ('connection_packets_sent_speech' in data) {
      this.connectionPacketsSentSpeech = Number(data.connection_packets_sent_speech!);
    }
    if ('connection_bytes_sent_speech' in data) {
      this.connectionBytesSentSpeech = Number(data.connection_bytes_sent_speech!);
    }
    if ('connection_packets_received_speech' in data) {
      this.connectionPacketsReceivedSpeech = Number(data.connection_packets_received_speech!);
    }
    if ('connection_bytes_received_speech' in data) {
      this.connectionBytesReceivedSpeech = Number(data.connection_bytes_received_speech!);
    }
    if ('connection_packets_sent_keepalive' in data) {
      this.connectionPacketsSentKeepAlive = Number(data.connection_packets_sent_keepalive!);
    }
    if ('connection_bytes_sent_keepalive' in data) {
      this.connectionBytesSentKeepAlive = Number(data.connection_bytes_sent_keepalive!);
    }
    if ('connection_packets_received_keepalive' in data) {
      this.connectionPacketsReceivedKeepAlive = Number(data.connection_packets_received_keepalive!);
    }
    if ('connection_bytes_received_keepalive' in data) {
      this.connectionBytesReceivedKeepAlive = Number(data.connection_bytes_received_keepalive!);
    }
    if ('connection_packets_sent_control' in data) {
      this.connectionPacketsSentControl = Number(data.connection_packets_sent_control!);
    }
    if ('connection_bytes_sent_control' in data) {
      this.connectionBytesSentControl = Number(data.connection_bytes_sent_control!);
    }
    if ('connection_packets_received_control' in data) {
      this.connectionPacketsReceivedControl = Number(data.connection_packets_received_control!);
    }
    if ('connection_bytes_received_control' in data) {
      this.connectionBytesReceivedControl = Number(data.connection_bytes_received_control!);
    }
    if ('connection_packets_sent_total' in data) {
      this.connectionPacketsSentTotal = Number(data.connection_packets_sent_total!);
    }
    if ('connection_bytes_sent_total' in data) {
      this.connectionBytesSentTotal = Number(data.connection_bytes_sent_total!);
    }
    if ('connection_packets_received_total' in data) {
      this.connectionPacketsReceivedTotal = Number(data.connection_packets_received_total!);
    }
    if ('connection_bytes_received_total' in data) {
      this.connectionBytesReceivedTotal = Number(data.connection_bytes_received_total!);
    }
    if ('connection_bandwidth_sent_last_second_total' in data) {
      this.connectionBandwidthSentLastSecondTotal = Number(
        data.connection_bandwidth_sent_last_second_total!,
      );
    }
    if ('connection_bandwidth_sent_last_minute_total' in data) {
      this.connectionBandwidthSentLastMinuteTotal = Number(
        data.connection_bandwidth_sent_last_minute_total!,
      );
    }
    if ('connection_bandwidth_received_last_second_total' in data) {
      this.connectionBandwidthReceivedLastSecondTotal = Number(
        data.connection_bandwidth_received_last_second_total!,
      );
    }
    if ('connection_bandwidth_received_last_minute_total' in data) {
      this.connectionBandwidthReceivedLastMinuteTotal = Number(
        data.connection_bandwidth_received_last_minute_total!,
      );
    }
  }

  /**
   * Start the virtual server.
   * @returns {Promise<void>} A promise that resolves when the virtual server has started.
   */
  start(): Promise<void> {
    return this.query.virtualServers.start(this);
  }

  /**
   * Stop the virtual server.
   * @param {string} reason The reason for stopping the virtual server. (optional)
   * @returns {Promise<void>} A promise that resolves when the virtual server has stopped.
   */
  stop(reason?: string): Promise<void> {
    return this.query.virtualServers.stop(this, reason);
  }
}
