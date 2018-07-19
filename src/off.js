/*
 * @Author: Xavier Yin 
 * @Date: 2018-07-07 01:49:28 
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2018-07-18 22:20:53
 */
import { reduceArgs, iterateApi, keys } from "./utils";
import { ACTION_FORWARD, ACTION_LISTEN } from "./consts";

function queryForward(handler) {
  let forwardTo = handler.callback._forwardTo;
  if (forwardTo === void 0 && handler.callback._callback) {
    forwardTo = handler.callback._callback._forwardTo;
  }
  return forwardTo;
}

function offApi(store, name, callback, options) {
  if (!store) return;

  let i = 0;
  let listening;
  let { context, listeners, action } = options;

  // 解除所有监听关系，同时清除自己绑定的事件（通过返回值 undefined 来实现）
  if (!name && callback === void 0 && !context) {
    let ids = keys(listeners);
    for (; i < ids.length; i++) {
      listening = listeners[ids[i]];
      delete listeners[listening.id];
      delete listening.listeningTo[listening.objId];
    }
    return;
  }

  let names = name ? [name] : keys(store);
  for (; i < names.length; i++) {
    name = names[i];
    let handlers = store[name];
    if (!handlers) break; // just break if handlers is really empty.
    let remaining = [];
    for (let j = 0; j < handlers.length; j++) {
      let handler = handlers[j];
      let keep = false;
      let forward = queryForward(handler);
      if (action === ACTION_FORWARD) {
        // 只解除 forward
        // 只要 forward === void 0 则表示该 handler 不是一个 forward 绑定，则留下。
        // 如果 callback !== void 0，则只有 foward 等于 callback 要清除，即 callback !== forward 的 handler 留下。
        if (
          forward === void 0 ||
          (context && context !== handler.context) ||
          (callback !== forward && callback !== handler.callback)
        ) {
          keep = true;
        }
      } else if (action === ACTION_LISTEN) {
        // 只解除 listen
        // 所有 forward 的 handler 留下
        if (
          forward !== void 0 ||
          (context && context !== handler.context) ||
          (callback !== void 0 &&
            callback !== handler.callback &&
            callback !== handler.callback._callback)
        ) {
          keep = true;
        }
      } else if (
        (callback !== void 0 &&
          callback !== handler.callback &&
          callback !== handler.callback._callback &&
          (forward !== void 0 && callback !== forward)) ||
        (context && context !== handler.context)
      ) {
        // 全部解除
        keep = true;
      }

      if (keep) {
        // 如果给出上下文 context，但 context 不匹配，则不能解除 handler。
        remaining.push(handler);
      } else {
        listening = handler.listening;
        if (listening && --listening.count === 0) {
          delete listeners[listening.id];
          delete listening.listeningTo[listening.objId];
        }
      }
    }

    if (remaining.length) {
      store[name] = remaining;
    } else {
      delete store[name];
    }
  }
  if (keys(store).length) return store;
}

/**
 *
 * @param {*} name
 * @param {*} callback
 * @param {*} options
 *  - action: 'forward', 'listen'
 */
export function off(name, callback, options) {
  if (!this._events) return this;
  if (name == null) {
    let { context, action } = options || {};
    this._events = offApi(this._events, name, callback, {
      context,
      listeners: this._listeners,
      action
    });
  } else {
    let [eventCallbackMap, opts] = reduceArgs(name, callback, options);
    let { context, action } = opts || {};
    this._events = iterateApi(offApi, this._events, eventCallbackMap, {
      context,
      listeners: this._listeners,
      action
    });
  }
  return this;
}

// 如果 stopListening 同时停止 forwarding 可能会造成 stopForwarding 方法的困扰。
// 虽然 forward 是借由 listenTo 实现，但二者上层应用的含义不同，最好还是区分
export function stopListening(obj, name, callback, context) {
  let listeningTo = this._listeningTo;
  if (!listeningTo) return this;

  let ids = obj ? [obj._listenId] : keys(listeningTo);

  for (let i = 0; i < ids.length; i++) {
    let listening = listeningTo[ids[i]];

    if (!listening) break;
    if (name == null) {
      listening.obj.off(name, callback, { context, action: ACTION_LISTEN });
    } else {
      let [map, _context] = reduceArgs(name, callback, context);
      listening.obj.off(map, { context: _context, action: ACTION_LISTEN });
    }
  }
  if (!keys(listeningTo).length) this._listeningTo = void 0;
  return this;
}
