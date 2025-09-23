import { EventEmitter } from 'events';
import * as net from 'net';
import { Transport } from './transport';

export class TCPTransport extends EventEmitter implements Transport {
  public isReady = false;

  private readonly host: string;
  private readonly port: number;
  private readonly onOutgoing: (data: string) => void;
  private socket!: net.Socket;
  private buffer = '';

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
    const payload = cmd.trim();
    this.socket.write(payload + '\n');
    this.onOutgoing(payload);
  }

  onData(callback: (data: string) => void): void {
    this.on('raw', callback);
  }

  destroy(): void {
    this.removeAllListeners();
    try {
      this.socket?.destroy();
    } catch {
      // ignore destroy errors
    }
  }

  private handleData(data: Buffer): void {
    this.buffer += data.toString();
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    for (const lineRaw of lines) {
      const line = lineRaw.trim();
      if (line.length === 0) continue;

      if (!this.isReady && line.startsWith('TS3')) {
        this.isReady = true;
        this.emit('ready');
        continue;
      }

      this.emit('raw', line);
    }
  }
}
