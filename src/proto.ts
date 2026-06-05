/*
 * @Author: Xavier Yin
 * @Date: 2019-09-20 17:32:35
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2020-08-07 16:40:11
 *
 * armorEvents 结构：
 * {
 *  id: string,
 *  events: {
 *    [event]: [handler.id]
 *  },
 *  handlers: {
 *    [handler.id]: handler
 *  },
 *  listenings: {
 *    [target.id]: {
 *      target,
 *      events: {
 *        [event]: [handler.id]
 *      }
 *    }
 *  }  // target.id 为 target._armorEvents.id
 * }
 *
 * handler 结构：
 * {
 *  id: string,
 *  event: string,
 *  handle: function|string|symbol,
 *  ctx: object,
 *  once: boolean,
 *  listener: object,
 *  disabled: boolean
 * }
 */

import { checkOwner } from "./check";
import { destroy } from "./destroy";
import { listenTo } from "./listen";
import { off, stopListening } from "./off";
import { on } from "./on";
import { trigger } from "./trigger";
import { noop } from "./utils";
import type { ArmorEventsApi, ArmorEventsOwner, ArmorEventsStatic } from "./types";

const eventsApi: ArmorEventsApi = {
  /**
   * 监听其他对象发生的事件。
   */
  listenTo(target: ArmorEventsOwner, events: unknown, handles: unknown, ctx?: any) {
    checkOwner(this as ArmorEventsOwner);
    checkOwner(target);
    let ids = listenTo(this as ArmorEventsOwner, target, events, handles, ctx);
    return ids.length ? () => destroy(target, ids) : noop;
  },

  /**
   * 监听其他对象发生的事件，响应一次后自动停止监听。
   */
  listenToOnce(target: ArmorEventsOwner, events: unknown, handles: unknown, ctx?: any) {
    checkOwner(this as ArmorEventsOwner);
    checkOwner(target);
    let ids = listenTo(this as ArmorEventsOwner, target, events, handles, ctx, true);
    return ids.length ? () => destroy(target, ids) : noop;
  },

  /**
   * 解绑事件。
   */
  off(events?: unknown, handles?: unknown, ctx?: any) {
    off(this as ArmorEventsOwner, events, handles, ctx);
    return this;
  },

  /**
   * 绑定事件。
   */
  on(events: unknown, handles: unknown, ctx?: any) {
    checkOwner(this as ArmorEventsOwner);
    let ids = on(this as ArmorEventsOwner, events, handles, ctx);
    return ids.length ? () => destroy(this as ArmorEventsOwner, ids) : noop;
  },

  /**
   * 绑定事件，事件响应一次后自动解绑。
   */
  once(events: unknown, handles: unknown, ctx?: any) {
    checkOwner(this as ArmorEventsOwner);
    let ids = on(this as ArmorEventsOwner, events, handles, ctx, true);
    return ids.length ? () => destroy(this as ArmorEventsOwner, ids) : noop;
  },

  /**
   * 停止监听。
   */
  stopListening(target?: ArmorEventsOwner | null, events?: unknown, handles?: unknown, ctx?: any) {
    stopListening(this as ArmorEventsOwner, target, events, handles, ctx);
    return this;
  },

  /**
   * 触发事件，同步执行所有回调函数。
   */
  trigger(events: unknown, ...args: any[]) {
    if ((this as ArmorEventsOwner)._armorEvents) {
      trigger(this as ArmorEventsOwner, events, args);
    }
    return this;
  },

  /**
   * 触发事件，异步执行所有回调函数。
   */
  triggerAsync(events: unknown, ...args: any[]) {
    if ((this as ArmorEventsOwner)._armorEvents) {
      trigger(this as ArmorEventsOwner, events, args, true);
    }
    return this;
  },
};

/**
 * 将事件 API 混入指定对象。
 */
function extendApi<T extends ArmorEventsOwner>(obj: T): T & ArmorEventsApi {
  for (let k in eventsApi) {
    (obj as any)[k] = (eventsApi as any)[k];
  }
  return obj as T & ArmorEventsApi;
}

/**
 * 如果 ArmorEvents 作为构造函数调用，它不接受任何参数。
 * 如果 ArmorEvents 作为函数调用，它接受一个 target 参数，表示将赋予 target 对象事件能力。
 */
const ArmorEvents = function ArmorEvents(this: ArmorEventsOwner, target?: ArmorEventsOwner | Function | null) {
  if (this instanceof (ArmorEvents as any)) {
    return;
  } else {
    let newObj: ArmorEventsOwner;
    let type = typeof target;
    newObj = target && ("object" === type || "function" === type) ? (target as ArmorEventsOwner) : {};
    return extendApi(newObj);
  }
} as ArmorEventsStatic;

extendApi(ArmorEvents.prototype);

extendApi(ArmorEvents as unknown as ArmorEventsOwner);

export default ArmorEvents;
