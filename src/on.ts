/*
 * @Author: Xavier Yin
 * @Date: 2019-09-20 16:50:33
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2019-09-24 15:22:06
 *
 * Event binding implementation for on/once and listenTo.
 */
import { uniqueId, isObject, isFunction, makeEventList, keys } from "./utils";
import type {
  ArmorEventsOwner,
  EventHandlerRecord,
} from "./types";

/**
 * 绑定单个事件和单个响应，并返回新建 handler id。
 */
function onApi(
  owner: ArmorEventsOwner,
  event: any,
  handle: any,
  ctx: any,
  once?: boolean,
  listener?: ArmorEventsOwner
): string {
  let { events, handlers } = owner._armorEvents!;
  let id = uniqueId("h");
  let handler = (handlers[id] = {
    id,
    event,
    handle,
    ctx,
    once: !!once,
    handleType: isFunction(handle) ? 0 : 1, // 0 - 回调，1 - 转发
  } as EventHandlerRecord);

  // 保持旧实现行为：只有 object listener 会被记录。
  if (isObject(listener)) handler.listener = listener;

  let queue = events[event] || (events[event] = []);
  queue.push(id);
  return id;
}

/**
 * 将多事件、多响应参数拆解成多次 onApi 调用。
 */
function onEvents(
  owner: ArmorEventsOwner,
  events: unknown,
  handles: unknown,
  ctx: any,
  once?: boolean
): string[] {
  let names = makeEventList(events);
  handles = makeEventList(handles, true);
  let ids: string[] = [];
  if (names.length && (handles as unknown[]).length) {
    for (let m = 0; m < names.length; m++) {
      for (let n = 0; n < (handles as unknown[]).length; n++) {
        // 保持旧实现行为：不允许转发到 all，也不允许事件转发给自身。
        if ((handles as unknown[])[n] !== "all" && (handles as unknown[])[n] !== names[m]) {
          ids.push(onApi(owner, names[m], (handles as unknown[])[n], ctx || owner, once));
        }
      }
    }
  }
  return ids;
}

/**
 * on/once 的内部入口，支持事件 map 和普通参数两种形式。
 */
function on(
  owner: ArmorEventsOwner,
  events: unknown,
  handles: unknown,
  ctx?: any,
  once?: boolean
): string[] {
  let handlerIds: string[] = [];
  if (isObject(events)) {
    once = ctx;
    ctx = handles;
    let names = keys(events);
    for (let i = 0; i < names.length; i++) {
      handlerIds = handlerIds.concat(
        onEvents(owner, names[i], (events as Record<PropertyKey, unknown>)[names[i]], ctx, once)
      );
    }
  } else {
    handlerIds = onEvents(owner, events, handles, ctx, once);
  }
  return handlerIds;
}

export { on, onApi };
