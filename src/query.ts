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
  LogLevel,
  RawPrivilegeKey,
} from './typings/teamspeak';
import { ServerGroupManager } from './managers/server-group-manager';
import { VirtualServerManager } from './managers/virtual-server-manager';
import { BanManager } from './managers/ban-manager';
import { ChannelGroupManager } from './managers/channel-group-manager';
import { PermissionManager } from './managers/permission-manager';
import { Instance } from './structures/instance';

interface ClientOptions {
  /**
   * The host you want to connect to.
   */
  host: string;
  /**
   * The port you want to connect to.
   */
  port?: number;
  /**
   * The protocol you want to use. (Currently not implemented)
   */
  protocol?: 'websocket' | 'ssh' | 'http'; //TODO: implement proper logic for this
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
   * The Query Client of the Query instance. Will be null until the client is logged in.
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

  /**
   * The Instance of the Query instance. Needs to be fetched first using fetchInstance().
   */
  public instance = null as unknown as Instance; // Overwrite type

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

  async fetchInstance(): Promise<Instance> {
    const data = await this.commands.instanceinfo();
    const instance = new Instance(this, data);
    this.instance = instance;
    return instance;
  }

  addLog(level: LogLevel, message: string): Promise<void> {
    return this.commands.logadd({ loglevel: level, logmsg: message });
  }

  async fetchLogs(): Promise<
    { timestamp: Date; level: string; module: string; virtualServerId: number; message: string }[]
  > {
    const _data = await this.commands.logview({});
    const data = Array.isArray(_data) ? _data : [_data];

    return data
      .map(({ l }) => l)
      .map((line) => {
        const [timestamp, level, prefix, id, message] = line.split('|').map((part) => part.trim());
        return {
          timestamp: new Date(timestamp),
          level,
          module: prefix,
          virtualServerId: Number(id),
          message,
        };
      });
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

  /**
   * Get a list of bindings.
   * @param subsystem The subsystem of the binding.
   */
  getRawBindings(
    subsystem?: 'voice' | 'query' | 'filetransfer',
  ): Promise<RawBinding | RawBinding[]> {
    return this.commands.bindinglist({ subsystem });
  }

  /**
   * Get a list of client database properties.
   * @param clientDatabaseId The ID of the client.
   */
  getRawClientDatabaseProperties(clientDatabaseId: number): Promise<RawClientDbInfo> {
    return this.commands.clientdbinfo({ cldbid: clientDatabaseId });
  }

  /**
   * Get a list of client unique IDs from their client IDs.
   * @param clientId The ID of the client.
   */
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

  /**
   * Get a list of client permissions.
   * @param clientDatabaseId The ID of the client.
   */
  getRawClientPermissions(
    clientDatabaseId: number,
  ): Promise<RawClientPermission | RawClientPermission[]> {
    return this.commands.clientpermlist({ cldbid: clientDatabaseId, _permsid: true });
  }

  /**
   * Get a list of channel permissions.
   * @param channelId The ID of the channel.
   */
  getRawChannelPermissions(
    channelId: number,
  ): Promise<RawChannelPermission | RawChannelPermission[]> {
    return this.commands.channelpermlist({ cid: channelId, _permsid: true });
  }

  /**
   * Get a list of database clients.
   */
  getRawDbClients(
    options: { start?: number; duration?: number; _count?: true } = {},
  ): Promise<RawDbClient | RawDbClient[]> {
    return this.commands.clientdblist(options);
  }

  /**
   * Get a list of privilege keys.
   */
  getRawPrivilegeKeys(): Promise<RawPrivilegeKey | RawPrivilegeKey[]> {
    return this.commands.privilegekeylist();
  }

  /**
   * Create a new privilege key.
   *
   * tokentype: 0 = group, 1 = channel
   *
   * tokenid1: Group ID
   *
   * tokenid2: Channel ID (if tokentype is 1)
   *
   * tokendescription: Description of the privilege key (optional)
   *
   * customset: Custom set of the privilege key (optional)
   *
   * @param params The parameters for the privilege key.
   * @returns The created privilege key.
   */
  async createRawPrivilegeKey(params: {
    tokentype: string;
    tokenid1: string;
    tokenid2: string;
    tokendescription?: string;
    customset: string;
  }): Promise<string> {
    const { token } = await this.commands.privilegekeyadd(params);
    return token;
  }

  /**
   * Delete a privilege key by its token.
   * @param token The token of the privilege key to delete.
   */
  deleteRawPrivilegeKey(token: string): Promise<void> {
    return this.commands.privilegekeydelete({ token });
  }

  /**
   * Use a privilege key by its token.
   * @param token The token of the privilege key to use.
   */
  useRawPrivilegeKey(token: string): Promise<void> {
    return this.commands.privilegekeyuse({ token });
  }
}
