/*
 * @Author: Xavier Yin 
 * @Date: 2018-07-07 01:53:05 
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2018-07-18 23:14:23
 */
import { iterateApi, reduceArgs, onceApi, keys, bind } from "./utils";
import { ACTION_FORWARD } from "./consts";

function forwardApi(obj, origin, dest, options) {
  if (dest != void 0 && "object" === typeof dest) return; // dest 应该是数字、字符、void 0, null
  if (dest === void 0) dest = null;
  let callback;
  let { listener, once } = options;
  if (origin === "all") {
    callback = function(eventName, ...args) {
      listener.trigger(
        dest === null ? eventName : dest,
        ...(dest === "all" ? arguments : args)
      );
    };
  } else {
    let _dest = dest === null ? origin : dest;
    callback = function() {
      listener.trigger(
        _dest,
        ...(_dest === "all" ? [origin, ...arguments] : arguments)
      );
    };
  }
  callback._forwardTo = dest;

  if (once) {
    listener.listenTo(
      obj,
      onceApi(
        {},
        origin,
        callback,
        bind(listener.stopForwarding, listener, obj)
      )
    );
  } else {
    listener.listenTo(obj, origin, callback);
  }
}

function _forward(obj, origin, dest, listener, once) {
  if (!obj) return listener;
  if (void 0 == origin) {
    forwardApi(obj, "all", dest, { listener, once });
  } else {
    let [map] = reduceArgs(origin, dest);
    iterateApi(forwardApi, obj, map, { listener, once });
  }
  return listener;
}

/**
 *
 * @param {*} obj
 * @param {*} origin
 * @param {*} dest
 *
 * forward(obj);
 * forward(obj, origin)
 * forward(obj, origin, dest)
 * forward(obj, {origin: dest})
 *
 * forward(obj, origin, dest);
 * 如果 origin 为 undefined 或 null，则等同于 'all'。
 * 如果 dest 为 undefined 或 null，则同名转发事件。
 * 如果 dest 为 'all'，则将按照 'all' api 进行转发。
 */
export function forward(obj, origin, dest) {
  return _forward(obj, origin, dest, this, false);
}

/**
 *
 * @param {*} obj
 * @param {*} origin
 * @param {*} dest
 */
export function forwardOnce(obj, origin, dest) {
  return _forward(obj, origin, dest, this, true);
}

export function stopForwarding(obj, origin, dest) {
  let listeningTo = this._listeningTo;
  if (!listeningTo) return this;

  let ids = obj ? [obj._listenId] : keys(listeningTo);

  for (let i = 0; i < ids.length; i++) {
    let listening = listeningTo[ids[i]];
    if (!listening) break;
    if (origin == null) {
      listening.obj.off(origin, dest, { action: ACTION_FORWARD });
    } else {
      let [map] = reduceArgs(origin, dest);
      listening.obj.off(map, { action: ACTION_FORWARD });
    }
  }
  if (!keys(listeningTo).length) this._listeningTo = void 0;
  return this;
}
