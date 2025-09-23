import { Query } from '../query';
import { RawInstance } from '../typings/teamspeak';
import { Base } from './base';

/**
 * Represents a instance.
 */
export class Instance extends Base {
  databaseVersion: number | null = null;
  filetransferPort: number | null = null;
  maxDownloadTotalBandwidth: number | null = null;
  maxUploadTotalBandwidth: number | null = null;
  guestServerqueryGroup: number | null = null;
  serverqueryFloodCommands: number | null = null;
  serverqueryFloodTime: number | null = null;
  serverqueryBanTime: number | null = null;
  templateServeradminGroup: number | null = null;
  templateServerdefaultGroup: number | null = null;
  templateChanneladminGroup: number | null = null;
  templateChanneldefaultGroup: number | null = null;
  permissionsVersion: number | null = null;
  pendingConnectionsPerIp: number | null = null;
  serverqueryMaxConnectionsPerIp: number | null = null;

  constructor(query: Query, data: Partial<RawInstance>) {
    super(query, 0);

    this._patch(data);
  }

  /**
   * Patches the instance with new data.
   * @param {Partial<RawInstance>} data The new data to patch the instance with.
   */
  _patch(data: Partial<RawInstance>): void {
    if ('serverinstance_database_version' in data) {
      this.databaseVersion = Number(data.serverinstance_database_version!);
    }
    if ('serverinstance_filetransfer_port' in data) {
      this.filetransferPort = Number(data.serverinstance_filetransfer_port!);
    }
    if ('serverinstance_max_download_total_bandwidth' in data) {
      this.maxDownloadTotalBandwidth = Number(data.serverinstance_max_download_total_bandwidth!);
    }
    if ('serverinstance_max_upload_total_bandwidth' in data) {
      this.maxUploadTotalBandwidth = Number(data.serverinstance_max_upload_total_bandwidth!);
    }
    if ('serverinstance_guest_serverquery_group' in data) {
      this.guestServerqueryGroup = Number(data.serverinstance_guest_serverquery_group!);
    }
    if ('serverinstance_serverquery_flood_commands' in data) {
      this.serverqueryFloodCommands = Number(data.serverinstance_serverquery_flood_commands!);
    }
    if ('serverinstance_serverquery_flood_time' in data) {
      this.serverqueryFloodTime = Number(data.serverinstance_serverquery_flood_time!);
    }
    if ('serverinstance_serverquery_ban_time' in data) {
      this.serverqueryBanTime = Number(data.serverinstance_serverquery_ban_time!);
    }
    if ('serverinstance_template_serveradmin_group' in data) {
      this.templateServeradminGroup = Number(data.serverinstance_template_serveradmin_group!);
    }
    if ('serverinstance_template_serverdefault_group' in data) {
      this.templateServerdefaultGroup = Number(data.serverinstance_template_serverdefault_group!);
    }
    if ('serverinstance_template_channeladmin_group' in data) {
      this.templateChanneladminGroup = Number(data.serverinstance_template_channeladmin_group!);
    }
    if ('serverinstance_template_channeldefault_group' in data) {
      this.templateChanneldefaultGroup = Number(data.serverinstance_template_channeldefault_group!);
    }
    if ('serverinstance_permissions_version' in data) {
      this.permissionsVersion = Number(data.serverinstance_permissions_version!);
    }
    if ('serverinstance_pending_connections_per_ip' in data) {
      this.pendingConnectionsPerIp = Number(data.serverinstance_pending_connections_per_ip!);
    }
    if ('serverinstance_serverquery_max_connections_per_ip' in data) {
      this.serverqueryMaxConnectionsPerIp = Number(
        data.serverinstance_serverquery_max_connections_per_ip!,
      );
    }
  }

  /**
   * Stop the instance.
   * @param {string} reason The reason for stopping the instance. (optional)
   * @returns {Promise<void>} A promise that resolves when the instance has stopped.
   */
  stop(reason?: string): Promise<void> {
    return this.query.stopServerProcess(reason);
  }
}
