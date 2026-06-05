/*
 * @Author: Xavier Yin
 * @Date: 2019-09-20 17:35:35
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2019-10-01 15:53:57
 *
 * Shared destroy logic for explicit unbind, off, once and stopListening.
 */

import { keys } from "./utils";
import type { ArmorEventsOwner } from "./types";

/**
 * 从指定事件队列中移除 handler id。
 */
function removeEvent(events: Record<PropertyKey, string[]>, event: any, handlerId: string): void {
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

/**
 * 从 listener 的 listenings 反向索引中移除 handler id。
 */
function removeListening(
  listenings: NonNullable<ArmorEventsOwner["_armorEvents"]>["listenings"],
  targetId: string,
  event: any,
  handlerId: string
): void {
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

/**
 * 销毁单个 handler，同时清理 owner 与 listener 两侧索引。
 */
function destroyApi(owner: ArmorEventsOwner, handlerId: string): void {
  let { id, handlers, events } = owner._armorEvents!;
  let handler = handlers[handlerId];
  if (handler) {
    // 标记 handler 已失效，触发队列中已捕获的 job 会据此跳过。
    handler.disabled = true;
    delete handlers[handlerId];
    let { event, listener } = handler;
    removeEvent(events, event, handlerId);
    if (listener) {
      let { listenings } = listener._armorEvents!;
      removeListening(listenings, id, event, handlerId);
    }
  }
}

/**
 * 批量销毁 handler。
 */
function destroy(owner: ArmorEventsOwner, handlerIds: string[]): void {
  if (owner && owner._armorEvents && handlerIds && handlerIds.length) {
    for (let i = 0; i < handlerIds.length; i++) {
      destroyApi(owner, handlerIds[i]);
    }
  }
}

export { destroy, destroyApi };
