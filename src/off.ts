/*
 * @Author: Xavier Yin
 * @Date: 2019-09-23 22:25:32
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2019-09-25 14:47:10
 *
 * Event unbinding and stopListening implementation.
 */

import { destroy } from "./destroy";
import { makeEventList, keys, includes, isObject } from "./utils";
import type { ArmorEventsOwner, EventHandlerRecord, ListeningRecord } from "./types";

/**
 * 根据事件名筛选候选 handler。
 */
function filterByEvents(owner: ArmorEventsOwner, events: unknown): EventHandlerRecord[] {
  let { events: _events, handlers } = owner._armorEvents!;
  events = events == null ? keys(_events) : makeEventList(events);
  let _handlers: EventHandlerRecord[] = [];
  for (let i = 0; i < (events as unknown[]).length; i++) {
    let queue = _events[(events as unknown[])[i] as PropertyKey];
    if (queue) {
      for (let h = 0; h < queue.length; h++) {
        let handler = handlers[queue[h]];
        if (handler) _handlers.push(handler);
      }
    }
  }
  return _handlers;
}

/**
 * 根据响应函数/转发事件名和上下文筛选 handler id。
 */
function filterByHandle(
  handlers: EventHandlerRecord[],
  handles: unknown,
  ctx: any
): string[] {
  let ids: string[] = [];
  if (handles != null) handles = makeEventList(handles, true);
  for (let i = 0; i < handlers.length; i++) {
    let handler = handlers[i];
    if (handles == null || includes(handles as any[], handler.handle as any)) {
      if (ctx == null || ctx === handler.ctx) {
        ids.push(handler.id);
      }
    }
  }
  return ids;
}

/**
 * 解绑 owner 上符合条件的事件响应。
 */
function off(owner: ArmorEventsOwner, events?: unknown, handles?: unknown, ctx?: any): void {
  if (owner._armorEvents) {
    let handlers = filterByEvents(owner, events);
    let ids = filterByHandle(handlers, handles, ctx);
    destroy(owner, ids);
  }
}

/**
 * 停止 listener 对 target 的监听。
 */
function stopListening(
  listener: ArmorEventsOwner,
  target?: unknown,
  events?: unknown,
  handles?: unknown,
  ctx?: any
): void {
  if (listener._armorEvents) {
    let { listenings } = listener._armorEvents;
    let temp: ListeningRecord[] = [];
    if (isObject(target)) {
      if ((target as ArmorEventsOwner)._armorEvents) {
        let listening = listenings[(target as ArmorEventsOwner)._armorEvents!.id];
        if (listening) temp.push(listening);
      } else {
        return;
      }
    } else {
      let ids = keys(listenings);
      for (let i = 0; i < ids.length; i++) {
        temp.push(listenings[ids[i] as string]);
      }
    }

    if (events != null) events = makeEventList(events);
    for (let i = 0; i < temp.length; i++) {
      let { target, events: _events } = temp[i];
      let names = events || keys(_events);
      let { handlers } = target._armorEvents!;
      let _handlers: EventHandlerRecord[] = [];
      for (let h = 0; h < (names as unknown[]).length; h++) {
        let queue = _events[(names as unknown[])[h] as PropertyKey];
        if (queue) {
          for (let j = 0; j < queue.length; j++) {
            let handler = handlers[queue[j]];
            if (handler) _handlers.push(handler);
          }
        }
      }
      destroy(target, filterByHandle(_handlers, handles, ctx));
    }
  }
}

export { off, stopListening };
