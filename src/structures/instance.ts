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
  _patch(_data: Partial<RawInstance>): void {
    if ('serverinstance_database_version' in _data) {
      this.databaseVersion = Number(_data.serverinstance_database_version!);
    }
    if ('serverinstance_filetransfer_port' in _data) {
      this.filetransferPort = Number(_data.serverinstance_filetransfer_port!);
    }
    if ('serverinstance_max_download_total_bandwidth' in _data) {
      this.maxDownloadTotalBandwidth = Number(_data.serverinstance_max_download_total_bandwidth!);
    }
    if ('serverinstance_max_upload_total_bandwidth' in _data) {
      this.maxUploadTotalBandwidth = Number(_data.serverinstance_max_upload_total_bandwidth!);
    }
    if ('serverinstance_guest_serverquery_group' in _data) {
      this.guestServerqueryGroup = Number(_data.serverinstance_guest_serverquery_group!);
    }
    if ('serverinstance_serverquery_flood_commands' in _data) {
      this.serverqueryFloodCommands = Number(_data.serverinstance_serverquery_flood_commands!);
    }
    if ('serverinstance_serverquery_flood_time' in _data) {
      this.serverqueryFloodTime = Number(_data.serverinstance_serverquery_flood_time!);
    }
    if ('serverinstance_serverquery_ban_time' in _data) {
      this.serverqueryBanTime = Number(_data.serverinstance_serverquery_ban_time!);
    }
    if ('serverinstance_template_serveradmin_group' in _data) {
      this.templateServeradminGroup = Number(_data.serverinstance_template_serveradmin_group!);
    }
    if ('serverinstance_template_serverdefault_group' in _data) {
      this.templateServerdefaultGroup = Number(_data.serverinstance_template_serverdefault_group!);
    }
    if ('serverinstance_template_channeladmin_group' in _data) {
      this.templateChanneladminGroup = Number(_data.serverinstance_template_channeladmin_group!);
    }
    if ('serverinstance_template_channeldefault_group' in _data) {
      this.templateChanneldefaultGroup = Number(
        _data.serverinstance_template_channeldefault_group!,
      );
    }
    if ('serverinstance_permissions_version' in _data) {
      this.permissionsVersion = Number(_data.serverinstance_permissions_version!);
    }
    if ('serverinstance_pending_connections_per_ip' in _data) {
      this.pendingConnectionsPerIp = Number(_data.serverinstance_pending_connections_per_ip!);
    }
    if ('serverinstance_serverquery_max_connections_per_ip' in _data) {
      this.serverqueryMaxConnectionsPerIp = Number(
        _data.serverinstance_serverquery_max_connections_per_ip!,
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
