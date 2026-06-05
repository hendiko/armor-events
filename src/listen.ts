/*
 * @Author: Xavier Yin
 * @Date: 2019-09-23 09:34:30
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2019-09-24 15:23:01
 *
 * listenTo/listenToOnce implementation.
 */

import { onApi } from "./on";
import { makeEventList, isObject, keys } from "./utils";
import type { ArmorEventsOwner } from "./types";

/**
 * 监听者 listener 在 owner 上绑定单个事件响应，并建立反向监听索引。
 */
function listenToApi(
  listener: ArmorEventsOwner,
  owner: ArmorEventsOwner,
  event: any,
  handle: any,
  ctx: any,
  once?: boolean
): string {
  let handlerId = onApi(owner, event, handle, ctx, once, listener);

  let { id } = owner._armorEvents!;
  let { listenings } = listener._armorEvents!;

  let listening = listenings[id];
  if (!listening) listening = listenings[id] = { target: owner, events: {} };

  let { events } = listening;
  let queue = events[event];
  if (!queue) queue = events[event] = [];
  queue.push(handlerId);

  return handlerId;
}

/**
 * 将多事件、多响应监听参数拆解成多次 listenToApi 调用。
 */
function listen(
  listener: ArmorEventsOwner,
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
        // 保持旧实现行为：listenTo 允许转发给自身事件名，但不允许转发 all。
        if ((handles as unknown[])[n] !== "all") {
          ids.push(
            listenToApi(
              listener,
              owner,
              names[m],
              (handles as unknown[])[n],
              ctx || listener,
              once
            )
          );
        }
      }
    }
  }
  return ids;
}

/**
 * listenTo/listenToOnce 的内部入口，支持事件 map 和普通参数两种形式。
 */
function listenTo(
  listener: ArmorEventsOwner,
  owner: ArmorEventsOwner,
  events: unknown,
  handles: unknown,
  ctx?: any,
  once?: boolean
): string[] {
  let ids: string[] = [];
  if (isObject(events)) {
    once = ctx;
    ctx = handles;
    let names = keys(events);
    for (let i = 0; i < names.length; i++) {
      ids = ids.concat(
        listen(listener, owner, names[i], (events as Record<PropertyKey, unknown>)[names[i]], ctx, once)
      );
    }
  } else {
    ids = listen(listener, owner, events, handles, ctx, once);
  }
  return ids;
}

export { listenTo };
