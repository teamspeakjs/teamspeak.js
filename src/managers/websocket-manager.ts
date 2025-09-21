import * as net from 'net';
import { EventEmitter } from 'events';

export class WebSocketManager extends EventEmitter {
  private host: string;
  private port: number;
  private onOutgoing: (data: string) => void;

  private socket!: net.Socket;
  private buffer = '';
  public isReady = false;

  constructor(host: string, port = 10011, onOutgoing: (data: string) => void) {
    super();
    this.host = host;
    this.port = port;
    this.onOutgoing = onOutgoing;
  }

  connect(): void {
    this.socket = net.createConnection({ host: this.host, port: this.port });

    this.socket.on('data', (data) => this.handleData(data));
    this.socket.on('error', (err) => this.emit('error', err));
    this.socket.on('end', () => this.emit('close'));
  }

  send(cmd: string): void {
    this.socket.write(cmd.trim() + '\n');
    this.onOutgoing(cmd.trim());
  }

  private handleData(data: Buffer): void {
    this.buffer += data.toString();
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (!this.isReady && trimmed.startsWith('TS3')) {
        this.isReady = true;
        this.emit('ready');
        continue;
      }

      this.emit('raw', trimmed);
    }
  }

  destroy(): void {
    this.removeAllListeners();
    // In tests or before connect(), the socket may not be initialized
    this.socket?.destroy();
  }
}
