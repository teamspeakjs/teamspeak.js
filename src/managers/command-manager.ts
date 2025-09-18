import { ServerGroupType } from '../docs';
import { Query } from '../query';

import { CommandExecutor } from '../services/command-executor';
import {
  RawChannel,
  RawChannelFindItem,
  RawChannelListItem,
  RawClient,
  RawClientDbid,
  RawClientFindItem,
  RawClientIds,
  RawClientName,
  RawClientServerGroup,
  RawHostInfo,
  RawInstance,
  RawVirtualServer,
  RawServerConnectionInfo,
  RawServerGroup,
  RawVirtualServerListItem,
  RawServerQueryInfo,
  RawVersion,
  RawApiKey,
  RawBan,
  RawClientIdsItem,
  RawChannelGroup,
  RawServerGroupClientListItem,
  RawComplain,
  RawServerSnapshot,
  RawBinding,
  RawClientDbInfo,
  RawClientUid,
  RawPermission,
  RawQueryLogin,
  RawClientPermission,
  RawChannelPermission,
} from '../typings/teamspeak';

/* eslint-disable @typescript-eslint/explicit-function-return-type */

export class CommandManager extends CommandExecutor {
  constructor(query: Query) {
    super(query);
  }

  apikeyadd(params: { scope: string; lifetime?: number; cldbid?: number }) {
    return this.query.commands._execute<RawApiKey>('apikeyadd', params);
  }

  apikeydel(params: { id: number }) {
    return this.query.commands._execute<void>('apikeydel', params);
  }

  apikeylist(params: { cldbid: number | '*'; start?: number; duration?: number; _count?: true }) {
    return this.query.commands._execute<RawApiKey | RawApiKey[]>('apikeylist', params);
  }

  banadd(params: {
    ip?: string;
    name?: string;
    uid?: string;
    mytsid?: string;
    time?: number;
    banreason?: string;
    lastnickname?: string;
  }) {
    return this.query.commands._execute<void>('banadd', params);
  }

  //Note: This theoratically supports multiple clients.
  banclient(params: { clid: number; time?: number; banreason?: string; _continueonerror?: true }) {
    return this.query.commands._execute<{ banid: string } | { banid: string }[]>(
      'banclient',
      params,
    );
  }

  bandel(params: { banid: number }) {
    return this.query.commands._execute<void>('bandel', params);
  }

  bandelall() {
    return this.query.commands._execute<void>('bandelall');
  }

  banlist(params: { start?: number; duration?: number; _count?: true } = {}) {
    return this.query.commands._execute<RawBan | RawBan[]>('banlist', params);
  }

  bindinglist(params: { subsystem?: 'voice' | 'query' | 'filetransfer' }) {
    return this.query.commands._execute<RawBinding | RawBinding[]>('bindinglist', params);
  }

  channeladdperm() {
    throw new Error('Not implemented');
  }

  channelclientaddperm() {
    throw new Error('Not implemented');
  }

  channelclientdelperm() {
    throw new Error('Not implemented');
  }

  channelclientpermlist() {
    throw new Error('Not implemented');
  }

  channelcreate(params: {
    channel_name: string;
    channel_topic?: string;
    channel_description?: string;
    channel_password?: string;
    channel_flag_password?: boolean;
    channel_codec?: number;
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

  channeldelete({ cid, force }: { cid: number; force?: boolean }): Promise<void> {
    return this.query.commands._execute<void>('channeldelete', { cid, force });
  }

  channeldelperm() {
    throw new Error('Not implemented');
  }

  channeledit(params: {
    cid: number;
    cpid?: number;
    channel_name?: string;
    channel_topic?: string;
    channel_description?: string;
    channel_password?: string;
    channel_codec?: number;
    channel_codec_quality?: number;
    channel_maxclients?: number;
    channel_maxfamilyclients?: number;
    channel_order?: number;
    channel_flag_permanent?: boolean;
    channel_flag_semi_permanent?: boolean;
    channel_flag_default?: boolean;
    channel_codec_is_unencrypted?: boolean;
    channel_delete_delay?: number;
    channel_flag_maxclients_unlimited?: boolean;
    channel_flag_maxfamilyclients_unlimited?: boolean;
    channel_flag_maxfamilyclients_inherited?: boolean;
    channel_needed_talk_power?: number;
    channel_name_phonetic?: string;
    channel_icon_id?: number;
    channel_banner_gfx_url?: string;
    channel_banner_mode?: number;
  }) {
    return this.query.commands._execute<void>('channeledit', params);
  }

  channelfind(params: { pattern: string }) {
    return this.query.commands._execute<RawChannelFindItem | RawChannelFindItem[]>(
      'channelfind',
      params,
    );
  }

  channelgroupadd(params: { name: string; type?: number }) {
    return this.query.commands._execute<{ cgid: string }>('channelgroupadd', params);
  }

  channelgroupaddperm() {
    throw new Error('Not implemented');
  }

  channelgroupclientlist() {
    throw new Error('Not implemented');
  }

  channelgroupcopy() {
    throw new Error('Not implemented');
  }

  channelgroupdel(params: { cgid: number; force?: boolean }) {
    return this.query.commands._execute<void>('channelgroupdel', params);
  }

  channelgroupdelperm() {
    throw new Error('Not implemented');
  }

  channelgrouplist() {
    return this.query.commands._execute<RawChannelGroup | RawChannelGroup[]>('channelgrouplist');
  }

  channelgrouppermlist() {
    throw new Error('Not implemented');
  }

  channelgrouprename(params: { cgid: number; name: string }) {
    return this.query.commands._execute<void>('channelgrouprename', params);
  }

  channelinfo(params: { cid: number }) {
    return this.query.commands._execute<RawChannel>('channelinfo', params);
  }

  channellist(
    params: {
      _topic?: true;
      _flags?: true;
      _voice?: true;
      _limits?: true;
      _icon?: true;
      _secondsempty?: true;
      _banners?: true;
    } = {},
  ) {
    return this.query.commands._execute<RawChannelListItem[]>('channellist', params);
  }

  channelmove(params: { cid: number; cpid: number; order?: number }) {
    return this.query.commands._execute<void>('channelmove', params);
  }

  channelpermlist(params: { cid: number; _permsid?: true }) {
    return this.query.commands._execute<RawChannelPermission | RawChannelPermission[]>(
      'channelpermlist',
      params,
    );
  }

  clientaddperm() {
    throw new Error('Not implemented');
  }

  clientdbdelete(params: { cldbid: number }) {
    return this.query.commands._execute<void>('clientdbdelete', params);
  }

  clientdbedit() {
    throw new Error('Not implemented');
  }

  clientdbfind() {
    throw new Error('Not implemented');
  }

  clientdbinfo(params: { cldbid: number }) {
    return this.query.commands._execute<RawClientDbInfo>('clientdbinfo', params);
  }

  clientdblist() {
    throw new Error('Not implemented');
  }

  clientdelperm() {
    throw new Error('Not implemented');
  }

  clientedit(params: {
    clid: number;
    client_nickname?: string;
    client_is_talker?: boolean;
    client_description?: string;
    client_is_channel_commander?: boolean;
    client_icon_id?: number;
  }) {
    return this.query.commands._execute<void>('clientedit', params);
  }

  clientfind(params: { pattern: string }) {
    return this.query.commands._execute<RawClientFindItem | RawClientFindItem[]>(
      'clientfind',
      params,
    );
  }

  clientgetdbidfromuid(params: { cluid: string }) {
    return this.query.commands._execute<RawClientDbid>('clientgetdbidfromuid', params);
  }

  clientgetids(params: { cluid: string }) {
    return this.query.commands._execute<RawClientIdsItem | RawClientIds>('clientgetids', params);
  }

  clientgetnamefromdbid(params: { cldbid: number }) {
    return this.query.commands._execute<RawClientName>('clientgetnamefromdbid', params);
  }

  clientgetnamefromuid(params: { cluid: string }) {
    return this.query.commands._execute<RawClientName>('clientgetnamefromuid', params);
  }

  //Note: This theoratically supports multiple clients.
  clientgetuidfromclid(params: { clid: number }) {
    return this.query.commands._execute<RawClientUid | RawClientUid[]>(
      'clientgetuidfromclid',
      params,
    );
  }

  clientinfo(params: { clid: number }) {
    return this.query.commands._execute<RawClient>('clientinfo', params);
  }

  //Note: This theoratically supports multiple clients.
  clientkick(params: {
    clid: number;
    reasonid: number;
    reasonmsg?: string;
    _continueonerror?: true;
  }) {
    return this.query.commands._execute<void>('clientkick', params);
  }

  clientlist(
    params: {
      _uid?: true;
      _away?: true;
      _voice?: true;
      _times?: true;
      _groups?: true;
      _info?: true;
      _country?: true;
      _ip?: true;
      _icon?: true;
      _badges?: true;
    } = {},
  ) {
    return this.query.commands._execute<RawClient | RawClient[]>('clientlist', params);
  }

  //Note: This theoratically supports multiple clients.
  clientmove(params: { clid: number; cid: number; cpw?: string; _continueonerror?: true }) {
    return this.query.commands._execute<void>('clientmove', params);
  }

  clientpermlist(params: { cldbid: number; _permsid?: true }) {
    return this.query.commands._execute<RawClientPermission | RawClientPermission[]>(
      'clientpermlist',
      params,
    );
  }

  clientpoke(params: { clid: number; msg: string }) {
    return this.query.commands._execute<void>('clientpoke', params);
  }

  clientsetserverquerylogin(params: { client_login_name: string }) {
    return this.query.commands._execute<{ client_login_password: string }>(
      'clientsetserverquerylogin',
      params,
    );
  }

  //Note: Possibly, there are more properties to edit than just the nickname
  clientupdate(params: { client_nickname?: string }) {
    return this.query.commands._execute<void>('clientupdate', params);
  }

  complainadd(params: { tcldbid: number; message: string }) {
    return this.query.commands._execute<void>('complainadd', params);
  }

  complaindel(params: { tcldbid: number; fcldbid: number }) {
    return this.query.commands._execute<void>('complaindel', params);
  }

  complaindelall(params: { tcldbid: number }) {
    return this.query.commands._execute<void>('complaindelall', params);
  }

  complainlist(params: { tcldbid?: number }) {
    return this.query.commands._execute<RawComplain | RawComplain[]>('complainlist', params);
  }

  custominfo() {
    throw new Error('Not implemented');
  }

  customsearch() {
    throw new Error('Not implemented');
  }

  customset() {
    throw new Error('Not implemented');
  }

  customdelete() {
    throw new Error('Not implemented');
  }

  ftcreatedir() {
    throw new Error('Not implemented');
  }

  ftdeletefile() {
    throw new Error('Not implemented');
  }

  ftgetfileinfo() {
    throw new Error('Not implemented');
  }

  ftgetfilelist() {
    throw new Error('Not implemented');
  }

  ftinitdownload() {
    throw new Error('Not implemented');
  }

  ftinitupload() {
    throw new Error('Not implemented');
  }

  ftlist() {
    throw new Error('Not implemented');
  }

  ftrenamefile() {
    throw new Error('Not implemented');
  }

  ftstop() {
    throw new Error('Not implemented');
  }

  gm(params: { msg: string }) {
    return this.query.commands._execute<void>('gm', params);
  }

  help() {
    throw new Error('Not implemented');
  }

  hostinfo() {
    return this.query.commands._execute<RawHostInfo>('hostinfo');
  }

  instanceedit() {
    throw new Error('Not implemented');
  }

  instanceinfo() {
    return this.query.commands._execute<RawInstance>('instanceinfo');
  }

  logadd() {
    throw new Error('Not implemented');
  }

  login(params: { client_login_name: string; client_login_password: string }) {
    return this.query.commands._execute<void>('login', params);
  }

  logout() {
    return this.query.commands._execute<void>('logout');
  }

  logview() {
    throw new Error('Not implemented');
  }

  messageadd() {
    throw new Error('Not implemented');
  }

  messagedel() {
    throw new Error('Not implemented');
  }

  messageget() {
    throw new Error('Not implemented');
  }

  messagelist() {
    throw new Error('Not implemented');
  }

  messageupdateflag() {
    throw new Error('Not implemented');
  }

  permfind() {
    throw new Error('Not implemented');
  }

  permget() {
    throw new Error('Not implemented');
  }

  permidgetbyname() {
    throw new Error('Not implemented');
  }

  permissionlist() {
    return this.query.commands._execute<RawPermission[]>('permissionlist');
  }

  permoverview() {
    throw new Error('Not implemented');
  }

  permreset() {
    throw new Error('Not implemented');
  }

  privilegekeyadd() {
    throw new Error('Not implemented');
  }

  privilegekeydelete() {
    throw new Error('Not implemented');
  }

  privilegekeylist() {
    throw new Error('Not implemented');
  }

  privilegekeyuse() {
    throw new Error('Not implemented');
  }

  queryloginadd() {
    throw new Error('Not implemented');
  }

  querylogindel() {
    throw new Error('Not implemented');
  }

  queryloginlist(params: { pattern?: string; start?: number; duration?: number; _count?: true }) {
    return this.query.commands._execute<RawQueryLogin | RawQueryLogin[]>('queryloginlist', params);
  }

  quit() {
    throw new Error('Not implemented');
  }

  sendtextmessage(params: { targetmode: number; target: number; msg: string }) {
    return this.query.commands._execute<void>('sendtextmessage', params);
  }

  servercreate() {
    throw new Error('Not implemented');
  }

  serverdelete(params: { sid: number }) {
    return this.query.commands._execute<void>('serverdelete', params);
  }

  serveredit() {
    throw new Error('Not implemented');
  }

  servergroupadd(params: { name: string; type?: number }) {
    return this.query.commands._execute<{ sgid: string }>('servergroupadd', params);
  }

  //Note: This theoratically supports multiple clients.
  servergroupaddclient(params: { sgid: number; cldbid: number; _continueonerror?: true }) {
    return this.query.commands._execute<void>('servergroupaddclient', params);
  }

  servergroupaddperm() {
    throw new Error('Not implemented');
  }

  servergroupautoaddperm() {
    throw new Error('Not implemented');
  }

  servergroupautodelperm() {
    throw new Error('Not implemented');
  }

  servergroupclientlist(params: { sgid: number; _names?: true }) {
    return this.query.commands._execute<
      RawServerGroupClientListItem | RawServerGroupClientListItem[] | null
    >('servergroupclientlist', params);
  }

  servergroupcopy(params: {
    ssgid: number;
    tsgid?: number;
    name?: string;
    type?: ServerGroupType;
  }) {
    return this.query.commands._execute<{ sgid: string }>('servergroupcopy', params);
  }

  servergroupdel(params: { sgid: number; force?: boolean }) {
    return this.query.commands._execute<void>('servergroupdel', params);
  }

  //Note: This theoratically supports multiple clients.
  servergroupdelclient(params: { sgid: number; cldbid: number; _continueonerror?: true }) {
    return this.query.commands._execute<void>('servergroupdelclient', params);
  }

  servergroupdelperm() {
    throw new Error('Not implemented');
  }

  servergrouplist() {
    return this.query.commands._execute<RawServerGroup | RawServerGroup[]>('servergrouplist');
  }

  servergrouppermlist() {
    throw new Error('Not implemented');
  }

  servergrouprename(params: { sgid: number; name: string }) {
    return this.query.commands._execute<void>('servergrouprename', params);
  }

  servergroupsbyclientid(params: { cldbid: number }) {
    return this.query.commands._execute<RawClientServerGroup | RawClientServerGroup[]>(
      'servergroupsbyclientid',
      params,
    );
  }

  serveridgetbyport(params: { virtualserver_port: number }) {
    return this.query.commands._execute<{ server_id: string }>('serveridgetbyport', params);
  }

  serverinfo() {
    return this.query.commands._execute<RawVirtualServer>('serverinfo');
  }

  serverlist(params: { _uid?: true; _short?: true; _all?: true; _onlyoffline?: true } = {}) {
    return this.query.commands._execute<RawVirtualServerListItem[]>('serverlist', params);
  }

  servernotifyregister(params: { event: string; id?: number }) {
    return this.query.commands._execute<void>('servernotifyregister', params);
  }

  servernotifyunregister() {
    return this.query.commands._execute<void>('servernotifyunregister');
  }

  serverprocessstop(params: { reasonmsg?: string }) {
    return this.query.commands._execute<void>('serverprocessstop', params);
  }

  serverrequestconnectioninfo() {
    return this.query.commands._execute<RawServerConnectionInfo>('serverrequestconnectioninfo');
  }

  serversnapshotcreate() {
    return this.query.commands._execute<RawServerSnapshot>('serversnapshotcreate');
  }

  serversnapshotdeploy(params: {
    version: number;
    data: string;
    password?: string;
    salt?: string;
    _keepfiles?: true;
    _mapping?: true;
  }) {
    return this.query.commands._execute<unknown>('serversnapshotdeploy', params); //TODO: Add proper type for response
  }

  serverstart(params: { sid: number }) {
    return this.query.commands._execute<void>('serverstart', params);
  }

  serverstop(params: { sid: number; reasonmsg?: string }) {
    return this.query.commands._execute<void>('serverstop', params);
  }

  servertemppasswordadd() {
    throw new Error('Not implemented');
  }

  servertemppassworddel() {
    throw new Error('Not implemented');
  }

  servertemppasswordlist() {
    throw new Error('Not implemented');
  }

  setclientchannelgroup() {
    throw new Error('Not implemented');
  }

  tokenadd() {
    throw new Error('Not implemented');
  }

  tokendelete() {
    throw new Error('Not implemented');
  }

  tokenlist() {
    throw new Error('Not implemented');
  }

  tokenuse() {
    throw new Error('Not implemented');
  }

  use(params: { sid?: number; port?: number; client_nickname?: string }) {
    return this.query.commands._execute<void>('use', params);
  }

  version() {
    return this.query.commands._execute<RawVersion>('version');
  }

  whoami() {
    return this.query.commands._execute<RawServerQueryInfo>('whoami');
  }
}
