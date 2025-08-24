export const Events = {
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
} as const;
