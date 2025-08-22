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
  public client: QueryClient | null = null;
  public actions = new ActionManager(this);

  constructor(options: ClientOptions) {
    super();
    this.ws = new WebSocketManager(options.host, options.port);
    this.commands.registerWsEvents();
  }

  ping(): void {
    this.ws.send('ping');
  }

  connect(): void {
    this.ws.connect();
  }

  login(username: string, password: string) {
    return this.commands.login({
      client_login_name: username,
      client_login_password: password,
    });
  }

  async useVirtualServer(id: number) {
    await this.commands.use({ sid: id });

    const serverQueryInfo = await this.commands.whoami();

    const client = await this.commands.clientinfo({ clid: Number(serverQueryInfo.client_id) });

    this.client = new QueryClient(this, client);
  }
}
