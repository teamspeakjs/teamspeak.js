import { Query } from '../query';
import { RawChannel, RawClient, RawInstance, RawServerQueryInfo } from '../typings/types';
import BaseManager from './base-manager';

type QueueItem = {
  command: string;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timeout?: NodeJS.Timeout;
};

type CommandError = {
  id: number;
  msg: string;
  extra_msg?: string;
};

export default class CommandManager extends BaseManager {
  private queue: QueueItem[] = [];

  // protocol state for serialized requests
  private inFlight = false;
  private responseLines: string[] = [];
  private current?: QueueItem;

  constructor(query: Query) {
    super(query);
  }

  async _execute<TData = unknown>(
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
      const error = err as CommandError;
      // detect flooding
      if (error && String(error.id) === '524' && error.extra_msg) {
        // extract seconds from "please wait X seconds"
        const match = /wait\s+(\d+)\s+seconds/i.exec(error.extra_msg);
        const delaySec = match ? parseInt(match[1], 10) : 1;

        // wait
        await new Promise((r) => setTimeout(r, delaySec * 1000));

        // retry once after waiting
        return await executeOnce();
      }
      throw new Error(
        `Failed to execute command "${name}": ${error.msg ?? err}. Code: ${error.id ?? 'unknown'}`,
      );
    }
  }

  makeParams(params: Record<string, string | number | boolean | undefined | number[]>): string {
    return Object.entries(params)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map((v) => `${key}=${this.escapeText(v.toString())}`).join(' ');
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
  public parseResponse(raw: string): { data: any; error: CommandError } {
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
    let errorObj: CommandError = { id: -1, msg: '' };
    if (errorLine) {
      const afterError = errorLine.replace(/^error\s+/, '');
      errorObj = this.parseRowToObject(afterError) as unknown as CommandError; // raw strings only
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
          cur.reject(parsed.error);
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

  registerWsEvents(): void {
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

      //TODO: Make this more frienly since this is ugly
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

  // START OF COMMAND LIST

  help() {
    throw new Error('Not implemented');
  }

  quit() {
    throw new Error('Not implemented');
  }

  login(params: { client_login_name: string; client_login_password: string }) {
    return this.query.commands._execute<void>('login', params);
  }

  logout() {
    throw new Error('Not implemented');
  }

  version() {
    throw new Error('Not implemented');
  }

  hostinfo() {
    throw new Error('Not implemented');
  }

  instanceinfo() {
    return this.query.commands._execute<RawInstance>('instanceinfo');
  }

  instanceedit() {
    throw new Error('Not implemented');
  }

  bindinglist() {
    throw new Error('Not implemented');
  }

  use(params: { sid: number }) {
    return this.query.commands._execute<void>('use', params);
  }

  serverlist() {
    throw new Error('Not implemented');
  }

  serveridgetbyport() {
    throw new Error('Not implemented');
  }

  serverdelete() {
    throw new Error('Not implemented');
  }

  servercreate() {
    throw new Error('Not implemented');
  }

  serverstart() {
    throw new Error('Not implemented');
  }

  serverstop() {
    throw new Error('Not implemented');
  }

  serverprocessstop() {
    throw new Error('Not implemented');
  }

  serverinfo() {
    throw new Error('Not implemented');
  }

  serverrequestconnectioninfo() {
    throw new Error('Not implemented');
  }

  serveredit() {
    throw new Error('Not implemented');
  }

  servergrouplist() {
    throw new Error('Not implemented');
  }

  servergroupadd() {
    throw new Error('Not implemented');
  }

  servergroupdel() {
    throw new Error('Not implemented');
  }

  servergrouprename() {
    throw new Error('Not implemented');
  }

  servergrouppermlist() {
    throw new Error('Not implemented');
  }

  servergroupaddperm() {
    throw new Error('Not implemented');
  }

  servergroupdelperm() {
    throw new Error('Not implemented');
  }

  servergroupclientlist() {
    throw new Error('Not implemented');
  }

  servergroupsbyclientid() {
    throw new Error('Not implemented');
  }

  serversnapshotcreate() {
    throw new Error('Not implemented');
  }

  serversnapshotdeploy() {
    throw new Error('Not implemented');
  }

  servernotifyregister() {
    throw new Error('Not implemented');
  }

  servernotifyunregister() {
    throw new Error('Not implemented');
  }

  gm() {
    throw new Error('Not implemented');
  }

  sendtextmessage(params: { targetmode: number; target: number; msg: string }) {
    return this.query.commands._execute<void>('sendtextmessage', params);
  }

  logview() {
    throw new Error('Not implemented');
  }

  logadd() {
    throw new Error('Not implemented');
  }

  channellist() {
    return this.query.commands._execute<RawChannel[]>('channellist');
  }

  channelinfo(params: { cid: number }) {
    return this.query.commands._execute<RawChannel>('channelinfo', params);
  }

  channelfind() {
    throw new Error('Not implemented');
  }

  channelmove() {
    throw new Error('Not implemented');
  }

  channelcreate(params: {
    channel_name: string;
    channel_topic?: string;
    channel_description?: string;
    channel_password?: string;
    channel_flag_password?: boolean;
    channel_codec?: string;
    channel_codec_quality?: number;
    channel_maxclients?: number;
    channel_maxfamilyclients?: number;
    channel_order?: number;
    channel_flag_permanent?: boolean;
    channel_flag_semi_permanent?: boolean;
    channel_flag_temporary?: boolean;
    channel_flag_default?: boolean;
    channel_flag_maxclients_unlimited?: boolean;
    channel_flag_maxfamilyclients_unlimited?: boolean;
    channel_flag_maxfamilyclients_inherited?: boolean;
    channel_needed_talk_power?: number;
    channel_name_phonetic?: string;
  }) {
    return this.query.commands._execute<{ cid: string }>('channelcreate', params);
  }

  channeledit(params: {
    cid: number;
    channel_name?: string;
    channel_topic?: string;
    channel_description?: string;
    channel_password?: string;
    channel_flag_password?: boolean;
    channel_codec?: string;
    channel_codec_quality?: number;
    channel_maxclients?: number;
    channel_maxfamilyclients?: number;
    channel_order?: number;
    channel_flag_permanent?: boolean;
    channel_flag_semi_permanent?: boolean;
    channel_flag_temporary?: boolean;
    channel_flag_default?: boolean;
    channel_flag_maxclients_unlimited?: boolean;
    channel_flag_maxfamilyclients_unlimited?: boolean;
    channel_flag_maxfamilyclients_inherited?: boolean;
    channel_needed_talk_power?: number;
    channel_name_phonetic?: string;
  }) {
    return this.query.commands._execute<void>('channeledit', params);
  }

  channeldelete({ cid, force }: { cid: number; force?: boolean }): Promise<void> {
    return this.query.commands._execute<void>('channeldelete', { cid, force });
  }

  channelpermlist() {
    throw new Error('Not implemented');
  }

  channeladdperm() {
    throw new Error('Not implemented');
  }

  channeldelperm() {
    throw new Error('Not implemented');
  }

  channelgrouplist() {
    throw new Error('Not implemented');
  }

  channelgroupadd() {
    throw new Error('Not implemented');
  }

  channelgroupdel() {
    throw new Error('Not implemented');
  }

  channelgrouprename() {
    throw new Error('Not implemented');
  }

  channelgroupaddperm() {
    throw new Error('Not implemented');
  }

  channelgrouppermlist() {
    throw new Error('Not implemented');
  }

  channelgroupclientlist() {
    throw new Error('Not implemented');
  }

  setclientchannelgroup() {
    throw new Error('Not implemented');
  }

  clientlist() {
    return this.query.commands._execute<RawClient | RawClient[]>('clientlist');
  }

  clientinfo(params: { clid: number }) {
    return this.query.commands._execute<RawClient>('clientinfo', params);
  }

  clientfind() {
    throw new Error('Not implemented');
  }

  clientedit() {
    throw new Error('Not implemented');
  }

  clientdblist() {
    throw new Error('Not implemented');
  }

  clientdbfind() {
    throw new Error('Not implemented');
  }

  clientdbedit() {
    throw new Error('Not implemented');
  }

  clientdbdelete() {
    throw new Error('Not implemented');
  }

  clientgetids() {
    throw new Error('Not implemented');
  }

  clientgetdbidfromuid() {
    throw new Error('Not implemented');
  }

  clientgetnamefromuid() {
    throw new Error('Not implemented');
  }

  clientgetnamefromdbid() {
    throw new Error('Not implemented');
  }

  clientsetserverquerylogin() {
    throw new Error('Not implemented');
  }

  clientupdate() {
    throw new Error('Not implemented');
  }

  clientmove() {
    throw new Error('Not implemented');
  }

  clientkick(params: { clid: number | number[]; reasonid: number; reasonmsg?: string }) {
    return this.query.commands._execute<void>('clientkick', params);
  }

  clientpoke() {
    throw new Error('Not implemented');
  }

  clientpermlist() {
    throw new Error('Not implemented');
  }

  clientaddperm() {
    throw new Error('Not implemented');
  }

  clientdelperm() {
    throw new Error('Not implemented');
  }

  channelclientpermlist() {
    throw new Error('Not implemented');
  }

  channelclientaddperm() {
    throw new Error('Not implemented');
  }

  channelclientdelperm() {
    throw new Error('Not implemented');
  }

  permissionlist() {
    throw new Error('Not implemented');
  }

  permissionadd() {
    throw new Error('Not implemented');
  }

  permoverview() {
    throw new Error('Not implemented');
  }

  permfind() {
    throw new Error('Not implemented');
  }

  tokenlist() {
    throw new Error('Not implemented');
  }

  tokenadd() {
    throw new Error('Not implemented');
  }

  tokendelete() {
    throw new Error('Not implemented');
  }

  tokenuse() {
    throw new Error('Not implemented');
  }

  messagelist() {
    throw new Error('Not implemented');
  }

  messageadd() {
    throw new Error('Not implemented');
  }

  messageget() {
    throw new Error('Not implemented');
  }

  messageupdateflag() {
    throw new Error('Not implemented');
  }

  messagedel() {
    throw new Error('Not implemented');
  }

  complainlist() {
    throw new Error('Not implemented');
  }

  complainadd() {
    throw new Error('Not implemented');
  }

  complaindel() {
    throw new Error('Not implemented');
  }

  complaindelall() {
    throw new Error('Not implemented');
  }

  banclient() {
    throw new Error('Not implemented');
  }

  banlist() {
    throw new Error('Not implemented');
  }

  banadd() {
    throw new Error('Not implemented');
  }

  bandel() {
    throw new Error('Not implemented');
  }

  ftinitupload() {
    throw new Error('Not implemented');
  }

  ftinitdownload() {
    throw new Error('Not implemented');
  }

  ftlist() {
    throw new Error('Not implemented');
  }

  ftgetfilelist() {
    throw new Error('Not implemented');
  }

  ftgetfileinfo() {
    throw new Error('Not implemented');
  }

  ftstop() {
    throw new Error('Not implemented');
  }

  ftdeletefile() {
    throw new Error('Not implemented');
  }

  ftcreatedir() {
    throw new Error('Not implemented');
  }

  ftrenamefile() {
    throw new Error('Not implemented');
  }

  whoami() {
    return this.query.commands._execute<RawServerQueryInfo>('whoami');
  }
}
