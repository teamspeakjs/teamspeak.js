import { Query } from '../query';
import { Action } from '../structures/action';
import { VirtualServer } from '../structures/virtual-server';
import { Events } from '../utils/events';

type Payload = {
  sid: string;
  token: string;
  virtualserver_name: string;
  virtualserver_welcomemessage?: string;
  virtualserver_maxclients?: string;
  virtualserver_password?: string;
  virtualserver_codec_encryption_mode?: string;
  virtualserver_encryption_ciphers?: string;
  virtualserver_hostmessage?: string;
  virtualserver_hostmessage_mode?: string;
  virtualserver_default_server_group?: string;
  virtualserver_default_channel_group?: string;
  virtualserver_hostbanner_url?: string;
  virtualserver_hostbanner_gfx_url?: string;
  virtualserver_hostbanner_gfx_interval?: string;
  virtualserver_weblist_enabled?: string;
  virtualserver_port?: string;
  virtualserver_machine_id?: string;
  virtualserver_autostart?: string;
};

export class VirtualServerCreateAction extends Action {
  constructor(query: Query) {
    super(query);
  }

  handle(data: Payload): { virtualServer: VirtualServer } {
    const existing = this.query.virtualServers.cache.get(Number(data.sid));
    const virtualServer = this.query.virtualServers._add(data);
    if (!existing && virtualServer) {
      this.query.emit(Events.VirtualServerCreate, virtualServer);
    }

    return {
      virtualServer,
    };
  }
}
