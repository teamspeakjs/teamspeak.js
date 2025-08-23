import Channel from '../structures/channel';
import Client from '../structures/client';

export type Constructable<Entity> = new (...args: any[]) => Entity;

export type ClientResolvable = Client | number;

export type ChannelResolvable = Channel | number;

export type If<Value extends boolean, TrueResult, FalseResult = null> = Value extends true
  ? TrueResult
  : Value extends false
    ? FalseResult
    : TrueResult | FalseResult;

export type EventTypes = {
  ChannelCreate: [channel: Channel, invoker: Client];
  ChannelUpdate: [before: Channel, after: Channel, invoker: Client];
  ChannelDelete: [channel: Channel, invoker: Client];
};
