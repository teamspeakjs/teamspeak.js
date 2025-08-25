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
import {
  RawClientDbid,
  RawClientIds,
  RawClientName,
  RawHostInfo,
  RawVirtualServer,
  RawServerConnectionInfo,
  RawVersion,
  TextMessageTargetMode,
} from './typings/teamspeak';
import ServerGroupManager from './managers/server-group-manager';
import VirtualServerManager from './managers/virtual-server-manager';

interface ClientOptions {
  host: string;
  port?: number;
}

/**
 * Represents a ServerQuery connection.
 */
export class Query extends AsyncEventEmitter<EventTypes> {
  public ws: WebSocketManager;

  public channels = new ChannelManager(this);
  public clients = new ClientManager(this);
  public commands = new CommandManager(this);
  public notifications = new NotificationManager(this);
  public client = null as unknown as QueryClient; // Overwrite type
  public actions = new ActionManager(this);
  public serverGroups = new ServerGroupManager(this);
  public virtualServers = new VirtualServerManager(this);

  private _pingInterval: NodeJS.Timeout | null = null;
  protected virtualServerId: number | null = null;

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
   * @param username The username to login with.
   * @param password The password to login with.
   */
  login(username: string, password: string): Promise<void> {
    return this.commands.login({
      client_login_name: username,
      client_login_password: password,
    });
  }

  /**
   * Select a virtual server by its ID.
   * @param id The virtual server ID.
   * @returns {Promise<void>}
   *
   * @deprecated Use Query.virtualServers.use(...) instead.
   */
  async useVirtualServer(id: number): Promise<void> {
    this.virtualServerId = id;

    await this.commands.use({ sid: id });

    const serverQueryInfo = await this.commands.whoami();

    const client = await this.commands.clientinfo({ clid: Number(serverQueryInfo.client_id) });

    this.client = new QueryClient(this, {
      ...client,
      clid: serverQueryInfo.client_id,
    });
  }

  /**
   * Select a virtual server by its port.
   * @param port The virtual server port.
   * @returns {Promise<void>}
   *
   * @deprecated Use Query.virtualServers.use(...) instead.
   */
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
  getRawServerInfo(): Promise<RawVirtualServer> {
    return this.commands.serverinfo();
  }

  /**
   * Get the raw Server ID by its port.
   * @param port The virtual server port.
   */
  getRawServerIdByPort(port: number): Promise<{ server_id: string }> {
    return this.commands.serveridgetbyport({ virtualserver_port: port });
  }

  /**
   * Sends a server message to virtual servers in the TeamSpeak 3 Server instance.
   * @param message The message to send.
   */
  sendHostMessage(content: string): Promise<void> {
    return this.commands.gm({ msg: content });
  }

  /**
   * Sends a server message to the current virtual server.
   * @param message The message to send.
   */
  sendServerMessage(content: string): Promise<void> {
    return this.commands.sendtextmessage({
      target: this.virtualServerId!,
      targetmode: TextMessageTargetMode.SERVER,
      msg: content,
    });
  }

  /**
   * Sends a message to the current channel.
   * @param content The message content.
   */
  sendChannelMessage(content: string): Promise<void> {
    return this.commands.sendtextmessage({
      targetmode: TextMessageTargetMode.CHANNEL,
      target: this.client.channelId!,
      msg: content,
    });
  }

  /**
   * Get the client IDs and nicknames by their unique identifier.
   * @param uniqueId The unique identifier of the client.
   */
  getRawClientIds(uniqueId: string): Promise<RawClientIds> {
    return this.commands.clientgetids({ cluid: uniqueId });
  }

  /**
   * Get the raw client database ID from its unique identifier.
   * @param uniqueId The unique identifier of the client.
   */
  getRawClientDatabaseIdFromUniqueId(uniqueId: string): Promise<RawClientDbid> {
    return this.commands.clientgetdbidfromuid({ cluid: uniqueId });
  }

  /**
   * Get the raw client name from its unique identifier.
   * @param uniqueId The unique identifier of the client.
   */
  getRawClientNameFromUniqueId(uniqueId: string): Promise<RawClientName> {
    return this.commands.clientgetnamefromuid({ cluid: uniqueId });
  }

  /**
   * Get the raw client name from its database ID.
   * @param dbid The database ID of the client.
   */
  getRawClientNameFromDatabaseId(dbid: number): Promise<RawClientName> {
    return this.commands.clientgetnamefromdbid({ cldbid: dbid });
  }

  /**
   * Get the raw server connection info.
   */
  getRawServerConnectionInfo(): Promise<RawServerConnectionInfo> {
    return this.commands.serverrequestconnectioninfo();
  }
}
