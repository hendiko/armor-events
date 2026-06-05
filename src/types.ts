/*
 * @Author: Xavier Yin
 * @Date: 2026-06-05 00:00:00
 *
 * Shared internal and public TypeScript types for armor-events.
 */
import type {
  AnyFunction,
  EventHandleInput,
  EventInput,
  EventItem,
  EventMap,
} from "./utils";
import type { Channel } from "./channel";

export type DestroyFunction = () => void;

export type EventCallback = AnyFunction;

export type EventHandler = EventItem | EventCallback;

export interface EventHandlerRecord {
  id: string;
  event: EventItem;
  handle: EventHandler;
  ctx: any;
  once: boolean;
  handleType: 0 | 1;
  listener?: ArmorEventsOwner;
  disabled?: boolean;
}

export interface ListeningRecord {
  target: ArmorEventsOwner;
  events: Record<PropertyKey, string[]>;
}

export interface ArmorEventsState {
  id: string;
  events: Record<PropertyKey, string[]>;
  handlers: Record<string, EventHandlerRecord>;
  listenings: Record<string, ListeningRecord>;
}

export interface ArmorEventsOwner {
  _armorEvents?: ArmorEventsState;
  [key: PropertyKey]: any;
}

export interface ArmorEventsApi {
  listenTo(
    target: ArmorEventsOwner,
    events: EventInput | EventMap,
    handles?: EventHandleInput | any,
    ctx?: any
  ): DestroyFunction;
  listenToOnce(
    target: ArmorEventsOwner,
    events: EventInput | EventMap,
    handles?: EventHandleInput | any,
    ctx?: any
  ): DestroyFunction;
  off(events?: EventInput | null, handles?: EventHandleInput | null, ctx?: any): this;
  on(
    events: EventInput | EventMap,
    handles?: EventHandleInput | any,
    ctx?: any
  ): DestroyFunction;
  once(
    events: EventInput | EventMap,
    handles?: EventHandleInput | any,
    ctx?: any
  ): DestroyFunction;
  stopListening(
    target?: ArmorEventsOwner | null,
    events?: EventInput | null,
    handles?: EventHandleInput | null,
    ctx?: any
  ): this;
  trigger(events: EventInput, ...args: any[]): this;
  triggerAsync(events: EventInput, ...args: any[]): this;
  channel?(events: EventInput): Channel;
}

export interface ArmorEventsInstance extends ArmorEventsOwner, ArmorEventsApi {}

export interface ArmorEventsStatic extends ArmorEventsApi {
  new (): ArmorEventsInstance;
  (target?: ArmorEventsOwner | Function | null): ArmorEventsInstance;
  prototype: ArmorEventsInstance;
  Channel?: typeof Channel;
}
