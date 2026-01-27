/**
 * The events of the TeamSpeak server.
 */
export const Events = {
  /**
   * The event when the client is ready.
   */
  Ready: 'Ready',
  /**
   * The event when an error occurs.
   */
  Error: 'Error',
  /**
   * The event when the client is closed.
   */
  Close: 'Close',
  /**
   * The event when a debug message is received.
   */
  Debug: 'Debug',

  /**
   * The event when a channel is created.
   */
  ChannelCreate: 'ChannelCreate',
  /**
   * The event when a channel is deleted.
   */
  ChannelDelete: 'ChannelDelete',
  /**
   * The event when a channel is updated.
   */
  ChannelUpdate: 'ChannelUpdate',

  /**
   * The event when a client enters a view.
   */
  ClientEnterView: 'ClientEnterView',
  /**
   * The event when a client leaves a view.
   */
  ClientLeaveView: 'ClientLeaveView',
  /**
   * The event when a client is updated.
   */
  ClientUpdate: 'ClientUpdate',
  /**
   * The event when a client moves.
   */
  ClientMove: 'ClientMove',

  /**
   * The event when a text message is received.
   */
  TextMessage: 'TextMessage',

  /**
   * The event when a server group is created.
   */
  ServerGroupCreate: 'ServerGroupCreate',
  /**
   * The event when a server group is deleted.
   */
  ServerGroupDelete: 'ServerGroupDelete',
  /**
   * The event when a server group is updated.
   */
  ServerGroupUpdate: 'ServerGroupUpdate',

  /**
   * The event when a ban is created.
   */
  BanCreate: 'BanCreate',
  /**
   * The event when a ban is deleted.
   */
  BanDelete: 'BanDelete',

  /**
   * The event when a channel group is created.
   */
  ChannelGroupCreate: 'ChannelGroupCreate',
  /**
   * The event when a channel group is deleted.
   */
  ChannelGroupDelete: 'ChannelGroupDelete',
  /**
   * The event when a channel group is updated.
   */
  ChannelGroupUpdate: 'ChannelGroupUpdate',

  /**
   * The event when a virtual server is created.
   */
  VirtualServerCreate: 'VirtualServerCreate',
  /**
   * The event when a virtual server is updated.
   */
  VirtualServerUpdate: 'VirtualServerUpdate',
  /**
   * The event when a virtual server is deleted.
   */
  VirtualServerDelete: 'VirtualServerDelete',

  /**
   * The event when a privilege key is created.
   */
  PrivilegeKeyCreate: 'PrivilegeKeyCreate',
  /**
   * The event when a privilege key is deleted.
   */
  PrivilegeKeyDelete: 'PrivilegeKeyDelete',
} as const;
