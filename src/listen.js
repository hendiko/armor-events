/*
 * @Author: Xavier Yin
 * @Date: 2019-09-23 09:34:30
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2019-09-24 15:23:01
 */

import { onApi } from "./on";
import { makeEventList, isObject, keys } from "./utils";

function listenToApi(listener, owner, event, handle, ctx, once) {
  let handlerId = onApi(owner, event, handle, ctx, once, listener);

  let { id } = owner._armorEvents;
  let { listenings } = listener._armorEvents;

  let listening = listenings[id];
  if (!listening) listening = listenings[id] = { target: owner, events: {} };

  let { events } = listening;
  let queue = events[event];
  if (!queue) queue = events[event] = [];
  queue.push(handlerId);

  return handlerId;
}

function listen(listener, owner, events, handles, ctx, once) {
  let names = makeEventList(events);
  handles = makeEventList(handles, true);
  let ids = [];
  if (names.length && handles.length) {
    for (let m = 0; m < names.length; m++) {
      for (let n = 0; n < handles.length; n++) {
        if (handles[n] !== "all") {
          ids.push(
            listenToApi(
              listener,
              owner,
              names[m],
              handles[n],
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

function listenTo(listener, owner, events, handles, ctx, once) {
  let ids = [];
  if (isObject(events)) {
    once = ctx;
    ctx = handles;
    let names = keys(events);
    for (let i = 0; i < names.length; i++) {
      ids = ids.concat(
        listen(listener, owner, names[i], events[names[i]], ctx, once)
      );
    }
  } else {
    ids = listen(listener, owner, events, handles, ctx, once);
  }
  return ids;
}

export { listenTo };
