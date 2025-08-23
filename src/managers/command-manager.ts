import { Query } from '../query';

import CommandExecutor from '../services/command-executor';
import {
  RawChannel,
  RawChannelListItem,
  RawClient,
  RawHostInfo,
  RawInstance,
  RawServer,
  RawServerListItem,
  RawServerQueryInfo,
  RawVersion,
} from '../typings/teamspeak';

export default class CommandManager extends CommandExecutor {
  constructor(query: Query) {
    super(query);
  }
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
    return this.query.commands._execute<RawVersion>('version');
  }

  hostinfo() {
    return this.query.commands._execute<RawHostInfo>('hostinfo');
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
    return this.query.commands._execute<RawServerListItem[]>('serverlist');
  }

  serveridgetbyport(params: { virtualserver_port: number }) {
    return this.query.commands._execute<{ server_id: string }>('serveridgetbyport', params);
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
    return this.query.commands._execute<RawServer>('serverinfo');
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

  gm(params: { msg: string }) {
    return this.query.commands._execute<void>('gm', params);
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
    return this.query.commands._execute<RawChannelListItem[]>('channellist');
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

  clientfind(params: { pattern: string }) {
    return this.query.commands._execute<RawClient | RawClient[]>('clientfind', params);
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
