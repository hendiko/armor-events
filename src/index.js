/*
 * @Author: Xavier Yin
 * @Date: 2019-09-20 17:32:35
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2019-10-01 00:51:07
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

const eventsApi = {
  /**
   * 监听其他对象发生的事件
   * @param {object} target 被监听对象（应具有事件能力的对象）
   * @param {string|symbol|number|array|object} events
   * @param {string|symbol|number|array|function} handles
   * @param {object} [ctx]
   */
  listenTo(target, events, handles, ctx) {
    checkOwner(this);
    checkOwner(target);
    let ids = listenTo(this, target, events, handles, ctx);
    return ids.length ? () => destroy(target, ids) : noop;
  },

  /**
   * 监听其他对象发生的事件，响应一次后自动停止监听
   * @param {object} target 被监听对象（应具有事件能力的对象）
   * @param {string|symbol|number|array|object} events
   * @param {string|symbol|number|array|function} handles
   * @param {object} [ctx]
   */
  listenToOnce(target, events, handles, ctx) {
    checkOwner(this);
    checkOwner(target);
    let ids = listenTo(this, target, events, handles, ctx, true);
    return ids.length ? () => destroy(target, ids) : noop;
  },

  /**
   * 解绑事件
   * @param {string|symbol|number|array} [events]
   * @param {string|symbol|number|array|function} [handles]
   * @param {object} [ctx]
   */
  off(events, handles, ctx) {
    off(this, events, handles, ctx);
    return this;
  },

  /**
   * 绑定事件
   * @param {string|symbol|number|array|object} events
   * @param {string|symbol|number|array|function} handles
   * @param {object} [ctx]
   */
  on(events, handles, ctx) {
    checkOwner(this);
    let ids = on(this, events, handles, ctx);
    return ids.length ? () => destroy(this, ids) : noop;
  },

  /**
   * 绑定事件，事件响应一次后自动解绑
   * @param {string|symbol|number|array|object} events
   * @param {string|symbol|number|array|function} handles
   * @param {object} [ctx]
   */
  once(events, handles, ctx) {
    checkOwner(this);
    let ids = on(this, events, handles, ctx, true);
    return ids.length ? () => destroy(this, ids) : noop;
  },

  /**
   * 停止监听
   * @param {object} [target] 被监听对象（应具有事件能力的对象）
   * @param {string|symbol|number|array} [events]
   * @param {string|symbol|number|array|function} [handles]
   * @param {object} [ctx]
   */
  stopListening(target, events, handles, ctx) {
    stopListening(this, target, events, handles, ctx);
    return this;
  },

  /**
   * 触发事件，同步执行所有回调函数
   * @param {string|symbol|number|array} events
   * @param  {...any} args
   */
  trigger(events, ...args) {
    if (this._armorEvents) {
      trigger(this, events, args);
    }
    return this;
  },

  /**
   * 触发事件，异步执行所有回调函数
   * @param {string|symbol|number|array} events
   * @param  {...any} args
   */
  triggerAsync(events, ...args) {
    if (this._armorEvents) {
      trigger(this, events, args, true);
    }
    return this;
  }
};

function extendApi(obj) {
  for (let k in eventsApi) {
    obj[k] = eventsApi[k];
  }
  return obj;
}

function ArmorEvents(obj) {
  let type = typeof obj;
  let _obj = obj && ("object" === type || "function" === type) ? obj : {};
  return extendApi(_obj);
}

extendApi(ArmorEvents);

module.exports = ArmorEvents;
