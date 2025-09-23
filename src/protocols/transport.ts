import { EventEmitter } from 'events';

export interface Transport extends EventEmitter {
  isReady: boolean;

  connect(): void;
  send(payload: string): void;
  destroy(): void;
  onData(callback: (data: string) => void): void;
}
