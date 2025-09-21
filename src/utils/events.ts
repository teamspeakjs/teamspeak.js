export const Events = {
  Ready: 'Ready',
  Error: 'Error',
  Close: 'Close',
  Debug: 'Debug',

  ChannelCreate: 'ChannelCreate',
  ChannelDelete: 'ChannelDelete',
  ChannelUpdate: 'ChannelUpdate',

  ClientEnterView: 'ClientEnterView',
  ClientLeaveView: 'ClientLeaveView',
  ClientUpdate: 'ClientUpdate',
  ClientMove: 'ClientMove',

  TextMessage: 'TextMessage',

  ServerGroupCreate: 'ServerGroupCreate',
  ServerGroupDelete: 'ServerGroupDelete',
  ServerGroupUpdate: 'ServerGroupUpdate',

  BanCreate: 'BanCreate',
  BanDelete: 'BanDelete',

  ChannelGroupCreate: 'ChannelGroupCreate',
  ChannelGroupDelete: 'ChannelGroupDelete',
  ChannelGroupUpdate: 'ChannelGroupUpdate',

  VirtualServerUpdate: 'VirtualServerUpdate',
  VirtualServerDelete: 'VirtualServerDelete',
} as const;
