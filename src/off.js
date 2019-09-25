/*
 * @Author: Xavier Yin
 * @Date: 2019-09-23 22:25:32
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2019-09-25 14:47:10
 */

import { destroy } from "./destroy";
import { makeEventList, keys, includes, isObject } from "./utils";

function filterByEvents(owner, events) {
  let { events: _events, handlers } = owner._armorEvents;
  events = events == null ? keys(_events) : makeEventList(events);
  let _handlers = [];
  for (let i = 0; i < events.length; i++) {
    let queue = _events[events[i]];
    if (queue) {
      for (let h = 0; h < queue.length; h++) {
        let handler = handlers[queue[h]];
        if (handler) _handlers.push(handler);
      }
    }
  }
  return _handlers;
}

function filterByHandle(handlers, handles, ctx) {
  let ids = [];
  if (handles != null) handles = makeEventList(handles, true);
  for (let i = 0; i < handlers.length; i++) {
    let handler = handlers[i];
    if (handles == null || includes(handles, handler.handle)) {
      if (ctx == null || ctx === handler.ctx) {
        ids.push(handler.id);
      }
    }
  }
  return ids;
}

function off(owner, events, handles, ctx) {
  if (owner._armorEvents) {
    let handlers = filterByEvents(owner, events);
    let ids = filterByHandle(handlers, handles, ctx);
    destroy(owner, ids);
  }
}

function stopListening(listener, target, events, handles, ctx) {
  if (listener._armorEvents) {
    let { listenings } = listener._armorEvents;
    let temp = [];
    if (isObject(target)) {
      if (target._armorEvents) {
        let listening = listenings[target._armorEvents.id];
        if (listening) temp.push(listening);
      } else {
        return;
      }
    } else {
      let ids = keys(listenings);
      for (let i = 0; i < ids.length; i++) {
        temp.push(listenings[ids[i]]);
      }
    }

    if (events != null) events = makeEventList(events);
    for (let i = 0; i < temp.length; i++) {
      let { target, events: _events } = temp[i];
      let names = events || keys(_events);
      let { handlers } = target._armorEvents;
      let _handlers = [];
      for (let h = 0; h < names.length; h++) {
        let queue = _events[names[h]];
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
