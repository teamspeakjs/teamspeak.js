import { Collection } from '@discordjs/collection';
import { Query } from '../query';
import { RawVirtualServer } from '../typings/teamspeak';
import { CachedManager } from './cached-manager';
import { VirtualServerResolvable } from '../typings/types';
import { VirtualServer } from '../structures/virtual-server';
import { QueryClient } from '../structures/query-client';

type VirtualServerUseOptions = {
  /**
   * The virtual server ID.
   */
  id?: number;
  /**
   * The virtual server port.
   */
  port?: number;
  /**
   * The default client nickname.
   */
  nickname?: string;
};

/**
 * Manages the virtual servers in the TeamSpeak host.
 */
export class VirtualServerManager extends CachedManager<VirtualServer, RawVirtualServer> {
  currentId: number | null = null;

  constructor(query: Query) {
    super(query, VirtualServer, 'virtualserver_id');
  }

  get current(): VirtualServer | null {
    if (this.currentId === null) return null;
    return this.cache.get(this.currentId) ?? null;
  }

  /**
   * Resolves a virtual server ID.
   * @param {VirtualServerResolvable} virtualServer The object to resolve.
   * @returns {number} The virtual server ID.
   */
  resolveId(virtualServer: VirtualServerResolvable): number {
    if (virtualServer instanceof VirtualServer) return virtualServer.id;
    return virtualServer;
  }

  /**
   * Fetches all virtual servers.
   * @returns {Promise<Collection<number, VirtualServer>>}
   */
  async fetch(): Promise<Collection<number, VirtualServer>> {
    const _data = await this.query.commands.serverlist({ _all: true, _uid: true });
    const data = Array.isArray(_data) ? _data : [_data];

    const servers = new Collection<number, VirtualServer>();

    for (const group of data) {
      servers.set(Number(group.virtualserver_id), this._add(group));
    }

    return servers;
  }

  /**
   * Fetches the currently used virtual server.
   * @returns {Promise<VirtualServer>}
   */
  async fetchCurrent(): Promise<VirtualServer> {
    const data = await this.query.commands.serverinfo();

    return this._add(data);
  }

  /**
   * Use a virtual server.
   * @param {VirtualServerResolvable} virtualServer The virtual server to use.
   */
  async use(virtualServer: VirtualServerResolvable): Promise<void>;

  /**
   * Use a virtual server.
   * @param {VirtualServerUseOptions} options The options for using the virtual server. Either id or port must be provided.
   */
  async use(options: VirtualServerUseOptions): Promise<void>;

  async use(options: VirtualServerResolvable | VirtualServerUseOptions): Promise<void> {
    if (options instanceof VirtualServer) {
      await this.query.commands.use({ sid: options.id });
    } else if (typeof options === 'number') {
      await this.query.commands.use({ sid: options });
    } else if (typeof options === 'object') {
      await this.query.commands.use({
        sid: options.id,
        port: options.port,
        client_nickname: options.nickname,
      });
    } else {
      throw new Error('Invalid virtual server use options');
    }

    const serverQueryInfo = await this.query.commands.whoami();

    this.currentId = Number(serverQueryInfo.virtualserver_id);

    const client = await this.query.commands.clientinfo({
      clid: Number(serverQueryInfo.client_id),
    });

    this.query.client = new QueryClient(this.query, {
      ...client,
      clid: serverQueryInfo.client_id,
    });
  }

  /**
   * Fetches a virtual server id by its port.
   * @param port The virtual server port.
   * @returns {Promise<number>} The virtual server ID.
   */
  async fetchServerIdByPort(port: number): Promise<number> {
    const { server_id } = await this.query.commands.serveridgetbyport({ virtualserver_port: port });

    return Number(server_id);
  }

  async delete(virtualServer: VirtualServerResolvable): Promise<void> {
    const id = this.resolveId(virtualServer);
    await this.query.commands.serverdelete({ sid: id });
    this.query.actions.VirtualServerDelete.handle({ sid: id.toString() });
  }

  /**
   * Start a virtual server.
   * @param {VirtualServerResolvable} virtualServer The virtual server to start.
   * @returns {Promise<void>} A promise that resolves when the virtual server has started.
   */
  start(virtualServer: VirtualServerResolvable): Promise<void> {
    return this.query.commands.serverstart({ sid: this.resolveId(virtualServer) });
  }

  /**
   * Stop a virtual server.
   * @param {VirtualServerResolvable} virtualServer The virtual server to stop.
   * @param {string} reason The reason for stopping the virtual server. (optional)
   * @returns {Promise<void>} A promise that resolves when the virtual server has stopped.
   */
  stop(virtualServer: VirtualServerResolvable, reason?: string): Promise<void> {
    return this.query.commands.serverstop({
      sid: this.resolveId(virtualServer),
      reasonmsg: reason,
    });
  }
}
