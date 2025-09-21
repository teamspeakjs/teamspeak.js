import { WebSocketManager } from './managers/websocket-manager';
import { ChannelManager } from './managers/channel-manager';
import { ClientManager } from './managers/client-manager';
import { CommandManager } from './managers/command-manager';
import { NotificationManager } from './managers/notification-manager';
import { QueryClient } from './structures/query-client';
import { ActionManager } from './managers/action-manager';
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
  RawApiKey,
  ApiKeyScope,
  RawClientIdsItem,
  RawComplain,
  RawServerSnapshot,
  RawBinding,
  RawClientDbInfo,
  RawClientUid,
  RawPermission,
  RawQueryLogin,
  RawClientPermission,
  RawChannelPermission,
  RawDbClient,
} from './typings/teamspeak';
import { ServerGroupManager } from './managers/server-group-manager';
import { VirtualServerManager } from './managers/virtual-server-manager';
import { BanManager } from './managers/ban-manager';
import { ChannelGroupManager } from './managers/channel-group-manager';
import { PermissionManager } from './managers/permission-manager';

interface ClientOptions {
  host: string;
  port?: number;
  protocol?: 'websocket' | 'ssh'; //TODO: implement proper logic for this
}

/**
 * Represents a ServerQuery connection.
 */
export class Query extends AsyncEventEmitter<EventTypes> {
  public ws: WebSocketManager;

  /**
   * The Channel Manager of the Query instance.
   */
  public channels = new ChannelManager(this);

  /**
   * The Client Manager of the Query instance.
   */
  public clients = new ClientManager(this);

  /**
   * The Command Manager of the Query instance.
   */
  public commands = new CommandManager(this);

  /**
   * The Notification Manager of the Query instance.
   */
  public notifications = new NotificationManager(this);

  /**
   * The Query Client of the Query instance.
   */
  public client = null as unknown as QueryClient; // Overwrite type

  /**
   * The Action Manager of the Query instance.
   */
  public actions = new ActionManager(this);

  /**
   * The Server Group Manager of the Query instance.
   */
  public serverGroups = new ServerGroupManager(this);

  /**
   * The Virtual Server Manager of the Query instance.
   */
  public virtualServers = new VirtualServerManager(this);

  /**
   * The Ban Manager of the Query instance.
   */
  public bans = new BanManager(this);

  /**
   * The Channel Group Manager of the Query instance.
   */
  public channelGroups = new ChannelGroupManager(this);

  /**
   * The Permission Manager of the Query instance.
   */
  public permissions = new PermissionManager(this);

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
    this.serverGroups.cache.clear();
    this.virtualServers.cache.clear();
    this.bans.cache.clear();
    this.channelGroups.cache.clear();
    this.permissions.cache.clear();
  }

  /**
   * Login to the ServerQuery.
   * @param {string} username The username to login with.
   * @param {string} password The password to login with.
   */
  login(username: string, password: string): Promise<void> {
    return this.commands.login({
      client_login_name: username,
      client_login_password: password,
    });
  }

  /**
   * Logout from the ServerQuery.
   */
  logout(): Promise<void> {
    return this.commands.logout();
  }

  /**
   * Select a virtual server by its ID.
   * @param {number} id The virtual server ID.
   * @returns {Promise<void>}
   *
   * @deprecated Use Query.virtualServers.use(...) instead.
   */
  async useVirtualServer(id: number): Promise<void> {
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
   * @param {number} port The virtual server port.
   * @returns {Promise<void>}
   *
   * @deprecated Use Query.virtualServers.use(...) instead.
   */
  async useVirtualServerByPort(port: number): Promise<void> {
    const { server_id } = await this.getRawServerIdByPort(port);

    return await this.useVirtualServer(Number(server_id));
  }

  /**
   * Sends a server message to virtual servers in the TeamSpeak 3 Server instance.
   * @param {string} content The message to send.
   */
  sendHostMessage(content: string): Promise<void> {
    return this.commands.gm({ msg: content });
  }

  /**
   * Sends a server message to the current virtual server.
   * @param {string} content The message to send.
   */
  sendServerMessage(content: string): Promise<void> {
    if (!this.virtualServers.currentId) throw new Error('No virtual server selected.');

    return this.commands.sendtextmessage({
      target: this.virtualServers.currentId,
      targetmode: TextMessageTargetMode.SERVER,
      msg: content,
    });
  }

  /**
   * Sends a message to the current channel.
   * @param {string} content The message content.
   */
  sendChannelMessage(content: string): Promise<void> {
    return this.commands.sendtextmessage({
      targetmode: TextMessageTargetMode.CHANNEL,
      target: this.client.channelId!,
      msg: content,
    });
  }

  /**
   * Update the login credentials for the current ServerQuery. You can only pass the username, the password will be generated automatically.
   * @param {string} username The username to set.
   * @returns {Promise<string>} The generated password.
   */
  async updateLoginCredentials(username: string): Promise<string> {
    const { client_login_password } = await this.commands.clientsetserverquerylogin({
      client_login_name: username,
    });

    return client_login_password;
  }

  /**
   * Stop the whole TeamSpeak 3 Server instance.
   * @param {string} reason The reason for stopping the server process. (optional)
   */
  stopServerProcess(reason?: string): Promise<void> {
    return this.commands.serverprocessstop({ reasonmsg: reason });
  }

  /**
   * Notice: All methods below this line are considered "raw" and return unprocessed data from the server. These methods will be deprecated and replaced with higher-level abstractions (e.g. Query.apiKeys.create(...)).
   */

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
   *
   * @deprecated Please use Query.virtualServers.fetchCurrent() instead.
   */
  getRawServerInfo(): Promise<RawVirtualServer> {
    return this.commands.serverinfo();
  }

  /**
   * Get the raw Server ID by its port.
   * @param port The virtual server port.
   *
   * @deprecated Please use Query.virtualServers.fetchServerIdByPort(port) instead.
   */
  getRawServerIdByPort(port: number): Promise<{ server_id: string }> {
    return this.commands.serveridgetbyport({ virtualserver_port: port });
  }

  /**
   * Get the client IDs and nicknames by their unique identifier.
   * @param uniqueId The unique identifier of the client.
   */
  getRawClientIds(uniqueId: string): Promise<RawClientIdsItem | RawClientIds> {
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

  /**
   * Create a new API key.
   *
   * scope: Scope of the API key (required).
   *
   * lifetime: Lifetime in days (optional, default: 14). Use 0 for no expiration.
   *
   * cldbid: Client Database ID of the client the key should be assigned to (optional). Otherwise, the invoker will be used.
   */
  createRawApiKey({
    scope,
    lifetime,
    cldbid,
  }: {
    scope: ApiKeyScope;
    lifetime?: number;
    cldbid?: number;
  }): Promise<RawApiKey> {
    return this.commands.apikeyadd({ scope, lifetime, cldbid });
  }

  /**
   * Get a list of API keys.
   *
   * cldbid: Client Database ID or "*" to get all keys.
   *
   * start: Starting index (optional, default: 0).
   *
   * duration: Maximum number of keys to return (optional, default: 100).
   *
   * count: Include total count (optional, default: false).
   */
  getRawApiKeys({
    cldbid,
    start,
    duration,
    count,
  }: {
    cldbid: number | '*';
    start?: number;
    duration?: number;
    count?: true;
  }): Promise<RawApiKey | RawApiKey[]> {
    return this.commands.apikeylist({
      cldbid,
      start,
      duration,
      _count: count,
    });
  }

  /**
   * Delete an API key by its ID.
   * @param id The ID of the API key to delete.
   */
  deleteRawApiKey(id: number): Promise<void> {
    return this.commands.apikeydel({ id });
  }

  /**
   * Get a list of complains.
   * @param tcldbid The client database ID of the complained about client. (optional, otherwise all complains will be returned)
   */
  getRawComplains(tcldbid?: number): Promise<RawComplain | RawComplain[]> {
    return this.commands.complainlist({ tcldbid });
  }

  /**
   * Create a new complain.
   * @param tcldbid The client database ID of the complained about client.
   * @param message The message of the complain.
   */
  createRawComplain(tcldbid: number, message: string): Promise<void> {
    return this.commands.complainadd({ tcldbid, message });
  }

  /**
   * Delete a complain by its IDs.
   * @param tcldbid The client database ID of the complained about client.
   * @param fcldbid The client database ID of the complainee.
   */
  deleteRawComplain(tcldbid: number, fcldbid: number): Promise<void> {
    return this.commands.complaindel({ tcldbid, fcldbid });
  }

  /**
   * Delete all complains by the complainee's ID.
   * @param tcldbid The client database ID of the complained about client.
   */
  deleteRawComplains(tcldbid: number): Promise<void> {
    return this.commands.complaindelall({ tcldbid });
  }

  /**
   * Create a new server snapshot.
   */
  createRawServerSnapshot(): Promise<RawServerSnapshot> {
    return this.commands.serversnapshotcreate();
  }

  /**
   * Deploy a server snapshot.
   * @param version The version of the server snapshot.
   * @param data The data of the server snapshot.
   */
  deployRawServerSnapshot(
    version: number,
    data: string,
    {
      password,
      salt,
      _keepfiles,
      _mapping,
    }: { password?: string; salt?: string; _keepfiles?: true; _mapping?: true } = {},
  ): Promise<unknown> {
    return this.commands.serversnapshotdeploy({
      version,
      data,
      password,
      salt,
      _keepfiles,
      _mapping,
    });
  }

  getRawBindings(
    subsystem?: 'voice' | 'query' | 'filetransfer',
  ): Promise<RawBinding | RawBinding[]> {
    return this.commands.bindinglist({ subsystem });
  }

  getRawClientDatabaseProperties(clientDatabaseId: number): Promise<RawClientDbInfo> {
    return this.commands.clientdbinfo({ cldbid: clientDatabaseId });
  }

  getRawClientUniqueIdFromClientId(clientId: number): Promise<RawClientUid | RawClientUid[]> {
    return this.commands.clientgetuidfromclid({ clid: clientId });
  }

  /**
   * Get a list of permissions on the TeamSpeak 3 Server instance.
   *
   * @deprecated Please use Query.permissions.fetch() instead.
   */
  getRawPermissions(): Promise<RawPermission[]> {
    return this.commands.permissionlist();
  }

  /**
   * Get a list of query logins across all virtual servers.
   */
  getRawQueryLogins(
    params: { pattern?: string; start?: number; duration?: number; _count?: true } = {},
  ): Promise<RawQueryLogin | RawQueryLogin[]> {
    return this.commands.queryloginlist(params);
  }

  getRawClientPermissions(
    clientDatabaseId: number,
  ): Promise<RawClientPermission | RawClientPermission[]> {
    return this.commands.clientpermlist({ cldbid: clientDatabaseId, _permsid: true });
  }

  getRawChannelPermissions(
    channelId: number,
  ): Promise<RawChannelPermission | RawChannelPermission[]> {
    return this.commands.channelpermlist({ cid: channelId, _permsid: true });
  }

  getRawDbClients(
    options: { start?: number; duration?: number; _count?: true } = {},
  ): Promise<RawDbClient | RawDbClient[]> {
    return this.commands.clientdblist(options);
  }
}
