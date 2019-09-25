/*
 * @Author: Xavier Yin
 * @Date: 2019-09-20 16:50:33
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2019-09-24 15:22:06
 */
import { uniqueId, isObject, isFunction, makeEventList, keys } from "./utils";

function onApi(owner, event, handle, ctx, once, listener) {
  let { events, handlers } = owner._armorEvents;
  let id = uniqueId("h");
  let handler = (handlers[id] = {
    id,
    event,
    handle,
    ctx,
    once: !!once,
    handleType: isFunction(handle) ? 0 : 1 // 0 - 回调，1 - 转发
  });
  if (isObject(listener)) handler.listener = listener;

  let queue = events[event] || (events[event] = []);
  queue.push(id);
  return id;
}

function onEvents(owner, events, handles, ctx, once) {
  let names = makeEventList(events);
  handles = makeEventList(handles, true);
  let ids = [];
  if (names.length && handles.length) {
    for (let m = 0; m < names.length; m++) {
      for (let n = 0; n < handles.length; n++) {
        if (handles[n] !== "all" && handles[n] !== names[m]) {
          ids.push(onApi(owner, names[m], handles[n], ctx || owner, once));
        }
      }
    }
  }
  return ids;
}

function on(owner, events, handles, ctx, once) {
  let handlerIds = [];
  if (isObject(events)) {
    once = ctx;
    ctx = handles;
    let names = keys(events);
    for (let i = 0; i < names.length; i++) {
      handlerIds = handlerIds.concat(
        onEvents(owner, names[i], events[names[i]], ctx, once)
      );
    }
  } else {
    handlerIds = onEvents(owner, events, handles, ctx, once);
  }
  return handlerIds;
}

export { on, onApi };
