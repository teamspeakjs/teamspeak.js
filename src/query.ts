// src/client/Client.ts
import WebSocketManager from './managers/websocket-manager';
import ChannelManager from './managers/channel-manager';
import ClientManager from './managers/client-manager';
import CommandManager from './managers/command-manager';
import NotificationManager from './managers/notification-manager';
import QueryClient from './structures/query-client';
import ActionManager from './managers/action-manager';
import { AsyncEventEmitter } from '@vladfrangu/async_event_emitter';
import { EventTypes } from './typings/types';
import { Events } from './utils/events';
import { RawHostInfo, RawServer, RawVersion } from './typings/teamspeak';

interface ClientOptions {
  host: string;
  port?: number;
}

export class Query extends AsyncEventEmitter<EventTypes> {
  public ws: WebSocketManager;

  public channels = new ChannelManager(this);
  public clients = new ClientManager(this);
  public commands = new CommandManager(this);
  public notifications = new NotificationManager(this);
  public client = null as unknown as QueryClient; // Overwrite type
  public actions = new ActionManager(this);

  private _pingInterval: NodeJS.Timeout | null = null;

  constructor(options: ClientOptions) {
    super();

    this.ws = new WebSocketManager(options.host, options.port, (data) => {
      this.emit(Events.Debug, `[CLIENT] ${data}`);
    });

    this.commands.registerWsEvents();

    this._pingInterval = setInterval(() => this._ping(), 120_000);

    this.ws.on('raw', (data) => {
      this.emit(Events.Debug, `[SERVER] ${data}`);
    });
  }

  /**
   * Send a ping to the server.
   *
   * This command does not officially exist and throws an error.
   */
  private _ping(): void {
    this.commands._execute('ping').catch(() => {});
  }

  /**
   * Connect to the Host.
   */
  connect(): void {
    this.ws.connect();
  }

  /**
   * Login to the ServerQuery.
   */
  login(username: string, password: string): Promise<void> {
    return this.commands.login({
      client_login_name: username,
      client_login_password: password,
    });
  }

  /**
   * Select a virtual server by its ID.
   */
  async useVirtualServer(id: number): Promise<void> {
    await this.commands.use({ sid: id });

    const serverQueryInfo = await this.commands.whoami();

    const client = await this.commands.clientinfo({ clid: Number(serverQueryInfo.client_id) });

    this.client = new QueryClient(this, client);
  }

  async useVirtualServerByPort(port: number): Promise<void> {
    const { server_id } = await this.getRawServerIdByPort(port);

    return await this.useVirtualServer(Number(server_id));
  }

  /**
   * Close the connection and destroy the Query instance.
   */
  destroy(): void {
    if (this._pingInterval) {
      clearInterval(this._pingInterval);
      this._pingInterval = null;
    }
    this.ws.destroy();
    this.removeAllListeners();

    this.channels.cache.clear();
    this.clients.cache.clear();
  }

  // TODO: Move all raw data fetching methods to a separate structures & managers.

  /**
   * Get the raw ServerQuery version information.
   */
  getRawServerVersion(): Promise<RawVersion> {
    return this.commands.version();
  }

  /**
   * Get the raw ServerQuery host information.
   */
  getRawHostInfo(): Promise<RawHostInfo> {
    return this.commands.hostinfo();
  }

  /**
   * Get the raw Server information.
   */
  getRawServerInfo(): Promise<RawServer> {
    return this.commands.serverinfo();
  }

  /**
   * Get the raw Server ID by its port.
   */
  getRawServerIdByPort(port: number): Promise<{ server_id: string }> {
    return this.commands.serveridgetbyport({ virtualserver_port: port });
  }

  /**
   * Sends a server message to virtual servers in the TeamSpeak 3 Server instance.
   * @param message The message to send.
   */
  sendHostMessage(message: string): Promise<void> {
    return this.commands.gm({ msg: message });
  }
}
