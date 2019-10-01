/*
 * @Author: Xavier Yin
 * @Date: 2019-09-20 17:35:35
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2019-10-01 15:53:57
 */

import { keys } from "./utils";

function removeEvent(events, event, handlerId) {
  let queue = events[event];
  if (queue) {
    let index = queue.indexOf(handlerId);
    if (index > -1) {
      queue.splice(index, 1);
    }
    if (!queue.length) {
      delete events[event];
    }
  }
}

function removeListening(listenings, targetId, event, handlerId) {
  let listening = listenings[targetId];
  if (listening) {
    let { events } = listening;
    if (events) {
      let queue = events[event];
      if (queue) {
        let index = queue.indexOf(handlerId);
        if (index > -1) {
          queue.splice(index, 1);
        }
        if (!queue.length) {
          delete events[event];
        }
      }
      if (!keys(events).length) {
        delete listenings[targetId];
      }
    }
  }
}

function destroyApi(owner, handlerId) {
  let { id, handlers, events } = owner._armorEvents;
  let handler = handlers[handlerId];
  if (handler) {
    // 标记 handler 已失效
    handler.disabled = true;
    delete handlers[handlerId];
    let { event, listener } = handler;
    removeEvent(events, event, handlerId);
    if (listener) {
      let { listenings } = listener._armorEvents;
      removeListening(listenings, id, event, handlerId);
    }
  }
}

function destroy(owner, handlerIds) {
  if (owner && owner._armorEvents && handlerIds && handlerIds.length) {
    for (let i = 0; i < handlerIds.length; i++) {
      destroyApi(owner, handlerIds[i]);
    }
  }
}

export { destroy, destroyApi };
