import { EventEmitter } from 'events';
import { Client, type ClientChannel, type ConnectConfig } from 'ssh2';
import { Transport } from './transport';

export type SSHAuth = Omit<ConnectConfig, 'host' | 'port'> & {
  username?: string;
  password?: string;
  privateKey?: string | Buffer;
  passphrase?: string;
  [key: string]: unknown;
};

export class SSHTransport extends EventEmitter implements Transport {
  public isReady = false;

  private readonly client: Client;
  private stream: ClientChannel | null = null;
  private buffer = '';

  private readonly host: string;
  private readonly port: number;
  private readonly auth: SSHAuth;
  private readonly onOutgoing: (data: string) => void;

  constructor(host: string, port = 10022, auth: SSHAuth, onOutgoing: (data: string) => void) {
    super();
    this.client = new Client();
    this.host = host;
    this.port = port;
    this.auth = auth;
    this.onOutgoing = onOutgoing;
  }

  connect(): void {
    this.client
      .on('ready', () => {
        this.client.shell((err: unknown, stream: ClientChannel) => {
          if (err) {
            this.emit('error', err);
            return;
          }
          this.stream = stream;
          stream.on('data', (data: Buffer) => this.handleData(data));
          stream.on('close', () => this.emit('close'));
          stream.on('error', (e: unknown) => this.emit('error', e));
        });
      })
      .on('error', (e: unknown) => this.emit('error', e))
      .on('close', () => this.emit('close'))
      .connect({
        host: this.host,
        port: this.port,
        ...this.auth,
      });
  }

  send(cmd: string): void {
    if (!this.stream) throw new Error('SSH stream not ready');
    const payload = cmd.trim();
    this.stream.write(payload + '\n');
    if (this.onOutgoing) this.onOutgoing(payload);
  }

  onData(callback: (data: string) => void): void {
    this.on('raw', callback);
  }

  destroy(): void {
    this.removeAllListeners();
    try {
      this.stream?.end();
    } catch {
      // ignore
    }
    this.stream = null;
    this.client.end();
  }

  private handleData(data: Buffer): void {
    this.buffer += data.toString();
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;

      if (!this.isReady && line.startsWith('TS3')) {
        this.isReady = true;
        this.emit('ready');
        continue;
      }

      // SSH echoes prompt/commands. Filter rules:
      //  - always forward notifications and error lines
      //  - drop lines whose head token (before first space) has no '=' (likely prompt/echo)
      //  - forward rows where every token is key=value or a bare alnum/underscore key
      const isNotification = line.startsWith('notify');
      const isError = line.startsWith('error ');
      if (isNotification || isError) {
        this.emit('raw', line);
        continue;
      }

      const firstSpaceIdx = line.indexOf(' ');
      const head = firstSpaceIdx >= 0 ? line.slice(0, firstSpaceIdx) : line;
      if (!head.includes('=')) {
        // prompt/echo like "serveradmin@9987(1)clientmove ..." → ignore
        continue;
      }

      const tokens = line.split(' ').filter((t) => t.length > 0);
      const isKvRow = tokens.every((t) => t.includes('=') || /^[A-Za-z0-9_]+$/.test(t));
      if (isKvRow) {
        this.emit('raw', line);
      }
    }
  }
}
