/*
 * @Author: Xavier Yin 
 * @Date: 2018-07-06 14:11:26 
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2018-07-18 23:14:57
 */

import { createListenId, Listening } from "./consts";
import { iterateApi, reduceArgs, onceApi, bind } from "./utils";

/**
 *
 * @param {object} events 事件存储空间
 * @param {string} name 事件名
 * @param {function} callback 事件回调函数
 * @param {object} options
 */
function bindApi(events, name, callback, options) {
  if (callback) {
    let handlers = events[name] || (events[name] = []);
    let { context, ctx, listening } = options;
    if (listening) listening.count++;
    handlers.push({
      callback,
      context,
      ctx: context || ctx,
      listening
    });
  }
  return events;
}

/**
 * 绑定事件
 *
 * arguments 1:
 * @param {string} name 事件名称
 * @param {function} callback 事件回调
 * @param {object} context 事件回调上下文
 *
 * arguments 2:
 * @param {object} name 事件名称与回调函数
 * @param {object} callback 事件回调的上下文
 */
export function on(name, callback, context) {
  let [eventCallbackMap, _context] = reduceArgs(name, callback, context);
  this._events = iterateApi(bindApi, this._events || {}, eventCallbackMap, {
    context: _context,
    ctx: this
  });
  return this;
}

/**
 * 绑定一次性事件
 *
 * arguments 1:
 * @param {string} name 事件名称
 * @param {function} callback 事件回调
 * @param {object} context 事件回调上下文
 *
 * arguments 2:
 * @param {object} name 事件名称与回调函数
 * @param {object} callback 事件回调的上下文
 */
export function once(name, callback, context) {
  let [map, _context] = reduceArgs(name, callback, context);
  let eventCallbackMap = iterateApi(onceApi, {}, map, bind(this.off, this));
  return this.on(eventCallbackMap, _context);
}

/**
 *
 * arguments 1:
 * @param {object} obj 被监听对象
 * @param {string} name 事件名称
 * @param {function} callback 事件回调
 * @param {object} context [new] 事件回调上下文
 *
 * arguments 2:
 * @param {object} obj 被监听对象
 * @param {object} name 事件名称与回调函数
 * @param {object} callback 事件回调的上下文
 */
export function listenTo(obj, name, callback, context) {
  if (!obj) return this;
  let objId = obj._listenId || (obj._listenId = createListenId());
  let listeningTo = this._listeningTo || (this._listeningTo = {});
  let listening = listeningTo[objId];
  if (!listening) {
    let id = this._listenId || (this._listenId = createListenId());
    listening = listeningTo[objId] = Listening({
      listenId: id,
      listeningTo,
      target: obj,
      targetListenId: objId,
      count: 0
    });
    let listeners = obj._listeners || (obj._listeners = {});
    listeners[id] = listening;
  }

  let [map, _context] = reduceArgs(name, callback, context);
  obj._events = iterateApi(bindApi, obj._events || {}, map, {
    context: _context,
    ctx: this,
    listening
  });

  return this;
}

export function listenToOnce(obj, name, callback, context) {
  if (!obj) return this;
  let [map, _context] = reduceArgs(name, callback, context);
  let eventCallbackMap = iterateApi(
    onceApi,
    {},
    map,
    bind(this.stopListening, this, obj)
  );
  return this.listenTo(obj, eventCallbackMap, _context);
}
