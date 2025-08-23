import CommandError from '../errors/command-error';
import { Query } from '../query';
import BaseManager from '../managers/base-manager';
import { RawCommandError } from '../typings/teamspeak';

type QueueItem = {
  command: string;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timeout?: NodeJS.Timeout;
};

export default abstract class CommandExecutor extends BaseManager {
  private queue: QueueItem[] = [];

  // protocol state for serialized requests
  private inFlight = false;
  private responseLines: string[] = [];
  private current?: QueueItem;

  constructor(query: Query) {
    super(query);
  }

  public async _execute<TData = unknown>(
    name: string,
    params?: Record<string, string | number | boolean | undefined | number[]>,
  ): Promise<TData> {
    const paramString = params ? this.makeParams(params) : '';
    const commandString = paramString ? `${name} ${paramString}` : name;

    // We'll wrap the execution in a helper to support retry
    const executeOnce = (): Promise<TData> => {
      return new Promise<TData>((resolve, reject) => {
        this.queue.push({
          command: commandString,
          resolve,
          reject,
        });
        this.processQueue();
      });
    };

    try {
      return await executeOnce();
    } catch (err: unknown) {
      const error =
        err instanceof CommandError ? err : new CommandError(name, err as RawCommandError);
      // detect flooding
      if (error && String(error.raw.id) === '524' && error.raw.extra_msg) {
        // extract seconds from "please wait X seconds"
        const match = /wait\s+(\d+)\s+seconds/i.exec(error.raw.extra_msg);
        const delaySec = match ? parseInt(match[1], 10) : 1;

        await new Promise((r) => setTimeout(r, delaySec * 1000 + 500)); // add a small buffer

        // retry once after waiting
        return await executeOnce();
      }

      throw error;
    }
  }

  private makeParams(
    params: Record<string, string | number | boolean | undefined | number[]>,
  ): string {
    return Object.entries(params)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map((v) => `${key}=${this.escapeText(v.toString())}`).join('|');
        }
        if (value === true) return `${key}=1`;
        if (value === false) return `${key}=0`;
        if (value === undefined) return undefined;
        return `${key}=${this.escapeText(value.toString())}`;
      })
      .filter((v) => v !== undefined)
      .join(' ');
  }

  private escapeText(input: string): string {
    return input
      .replace(/\\/g, '\\\\')
      .replace(/\//g, '\\/')
      .replace(/\|/g, '\\p')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/ /g, '\\s');
  }

  private unescapeTS(input: string): string {
    let out = '';
    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      if (ch === '\\' && i + 1 < input.length) {
        const n = input[i + 1];
        i++; // skip the escaped char
        switch (n) {
          case 's':
            out += ' ';
            break;
          case 'p':
            out += '|';
            break;
          case '/':
            out += '/';
            break;
          case '\\':
            out += '\\';
            break;
          case 'n':
            out += '\n';
            break;
          case 'r':
            out += '\r';
            break;
          case 't':
            out += '\t';
            break;
          default:
            // unknown escape -> just append the character
            out += n;
            break;
        }
      } else {
        out += ch;
      }
    }
    return out;
  }

  private parseRowToObject(row: string): Record<string, string> {
    const obj: Record<string, string> = {};
    let i = 0;
    const len = row.length;

    while (i < len) {
      // parse key
      let keyRaw = '';
      let hasEqual = false;
      while (i < len) {
        const ch = row[i];
        if (ch === '=') {
          i++; // consume '='
          hasEqual = true;
          break;
        }
        if (ch === ' ') break; // no '=' → key without value
        if (ch === '\\' && i + 1 < len) {
          keyRaw += ch + row[i + 1];
          i += 2;
        } else {
          keyRaw += ch;
          i++;
        }
      }

      // parse value only if '=' was found
      let valRaw = '';
      if (hasEqual) {
        while (i < len) {
          const ch = row[i];
          if (ch === ' ') {
            i++; // consume space separator
            break;
          }
          if (ch === '\\' && i + 1 < len) {
            valRaw += ch + row[i + 1];
            i += 2;
          } else {
            valRaw += ch;
            i++;
          }
        }
      } else {
        // no value, skip trailing space if present
        if (i < len && row[i] === ' ') i++;
      }

      const key = this.unescapeTS(keyRaw);
      const val = this.unescapeTS(valRaw);
      if (key.length > 0) obj[key] = val;
    }

    return obj;
  }

  /**
   * Parse a raw ServerQuery response (the raw string your command promise resolves with).
   * Returns { data, error } where:
   *  - data is an object | array | string | null
   *  - error is an object like { id: number, msg: string, ... }
   */
  private parseResponse(raw: string): { data: any; error: RawCommandError } {
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // find the final "error ..." line (usually the last non-empty line)
    let errorIdx = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].startsWith('error')) {
        errorIdx = i;
        break;
      }
    }

    const errorLine = errorIdx >= 0 ? lines[errorIdx] : undefined;
    const dataLines = errorIdx >= 0 ? lines.slice(0, errorIdx) : lines;

    // collect rows (split each data line by '|' which separates rows)
    const rows: string[] = [];
    for (const l of dataLines) {
      const parts = l.split('|'); // unescaped | is row separator
      for (const p of parts) {
        const trimmed = p.trim();
        if (trimmed.length > 0) rows.push(trimmed);
      }
    }

    const parsedRows = rows.map((r) => this.parseRowToObject(r));
    const typedRows = parsedRows; // keep as strings

    // Always keep objects intact, never unwrap single-key objects
    let data: any = null;
    if (typedRows.length === 0) {
      data = null;
    } else if (typedRows.length === 1) {
      data = typedRows[0];
    } else {
      data = typedRows;
    }

    // parse error line into object
    let errorObj: RawCommandError = { id: -1, msg: '' };
    if (errorLine) {
      const afterError = errorLine.replace(/^error\s+/, '');
      errorObj = this.parseRowToObject(afterError) as unknown as RawCommandError; // raw strings only
    }

    return { data, error: errorObj };
  }

  /**
   * Parse a single-line ServerQuery fragment (no trailing "error" line).
   * Useful for notifications and unsolicited server messages.
   */
  private parseInline(raw: string): { data: any } {
    const parts = raw
      .split('|')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const parsedRows = parts.map((p) => this.parseRowToObject(p));
    const typedRows = parsedRows; // keep as strings

    // Always keep objects intact, never unwrap single-key objects
    let data: any = null;
    if (typedRows.length === 0) {
      data = null;
    } else if (typedRows.length === 1) {
      data = typedRows[0];
    } else {
      data = typedRows;
    }

    return { data };
  }

  private handleProtocolLine(line: string): void {
    // notifications have already been handled in handleRaw, ignore here
    if (line.startsWith('notify')) return;

    // If there is no command in flight, ignore (handleRaw already emitted server)
    if (!this.inFlight) return;

    // part of the response for the in-flight command
    this.responseLines.push(line);

    // server ends responses with a line that begins with "error id="
    if (line.startsWith('error id=')) {
      const full = this.responseLines.join('\n');
      // clear timeout if any
      if (this.current && this.current.timeout) {
        clearTimeout(this.current.timeout);
        this.current.timeout = undefined;
      }

      // resolve the promise of the current item with parsed response
      const cur = this.current!;
      // reset protocol state
      this.inFlight = false;
      this.current = undefined;
      this.responseLines = [];

      // parse and emit a 'response' event for observers
      let parsed;
      try {
        parsed = this.parseResponse(full);
      } catch (e) {
        this.query.emit('error', e);
        parsed = { data: null, error: { id: -1, msg: 'parse_error' } };
      }

      // emit parsed response for consumers who prefer an event
      this.query.emit('response', parsed);

      // resolve after resetting state so next item can start
      try {
        if (parsed.error.msg != 'ok') {
          cur.reject(new CommandError(cur.command.split(' ')[0], parsed.error));
        } else {
          cur.resolve(parsed.data);
        }
      } catch (e) {
        // swallow resolve errors but emit for visibility
        this.query.emit('error', e);
      }

      // continue with next queued command
      this.processQueue();
    }
  }

  private processQueue(): void {
    if (this.inFlight) return;
    const next = this.queue.shift();
    if (!next) return;

    if (!this.query.ws) {
      next.reject(new Error('WebSocket manager missing'));
      return;
    }

    this.inFlight = true;
    this.current = next;
    this.responseLines = [];

    // safety timeout (adjust as needed)
    const t = setTimeout(() => {
      if (!this.inFlight) return;
      this.inFlight = false;
      const cur = this.current;
      this.current = undefined;
      this.responseLines = [];
      if (cur) cur.reject(new Error('command timed out waiting for response'));
      // proceed to next queued command
      this.processQueue();
    }, 10_000); // 10s default timeout

    next.timeout = t;

    // send the command (WebSocketManager.send is expected to send a string)
    try {
      this.query.ws.send(next.command);
    } catch (err) {
      clearTimeout(t);
      this.inFlight = false;
      this.current = undefined;
      this.responseLines = [];
      next.reject(err);
      // continue processing queue despite error
      this.processQueue();
    }
  }

  public registerWsEvents(): void {
    this.query.ws.on('ready', () => this.query.emit('ready'));
    // single raw handler to keep ordering deterministic
    this.query.ws.on('raw', (line: string) => {
      // always emit debug (raw string)
      this.query.emit('debug', line);
      // let the raw handler produce parsed notifications / server events
      this.handleRaw(line);
      // let protocol-level handler manage command responses
      this.handleProtocolLine(line);
    });
    this.query.ws.on('error', (err: any) => this.query.emit('error', err));
    this.query.ws.on('close', () => this.query.emit('close'));
  }

  /**
   * Handle all raw messages that are not part of a command response,
   * converting them to parsed objects and re-emitting as events.
   */
  private handleRaw(line: string): void {
    // Notifications: "notify<type> key=val key2=val2|..."
    if (line.startsWith('notify')) {
      const firstSpaceIdx = line.indexOf(' ');
      const eventName = firstSpaceIdx >= 0 ? line.slice(0, firstSpaceIdx) : line;
      const rest = firstSpaceIdx >= 0 ? line.slice(firstSpaceIdx + 1) : '';
      const parsed = rest.length > 0 ? this.parseInline(rest) : { data: null };

      //replace the FIRST starting "notify" with nothing. Only the FIRST occurrence
      const cleanedEventName = eventName.slice(6) as keyof typeof this.query.notifications;

      const notification = this.query.notifications[cleanedEventName];

      //TODO: Make this more friendly since this is ugly
      if (notification) {
        if ('handle' in notification) notification.handle(parsed.data);
      } else {
        console.warn(`Unhandled notification type: ${cleanedEventName}`);
      }

      return;
    }

    // If there's no command in flight, treat this as an unsolicited server message
    if (!this.inFlight) {
      // Try to parse it inline and emit structured 'server' event
      const parsed = this.parseInline(line);
      this.query.emit('server', parsed);
      return;
    }

    // Otherwise if a command is in-flight, we don't handle it here (protocol handler will)
  }
}
