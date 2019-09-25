/*
 * @Author: Xavier Yin 
 * @Date: 2018-07-06 22:10:56 
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2018-07-18 23:55:30
 */

import { iterateApi } from "./utils";

function callHandlers(handlers, args) {
  if (!handlers) return;
  let [ev, i, l] = [void 0, -1, handlers.length];
  let [a1, a2, a3] = args;
  switch (args.length) {
    case 0:
      // it should never get here, because args length can't be less than 1.
      while (++i < l) (ev = handlers[i]).callback.call(ev.ctx);
      return;
    case 1:
      while (++i < l) (ev = handlers[i]).callback.call(ev.ctx, a1);
      return;
    case 2:
      while (++i < l) (ev = handlers[i]).callback.call(ev.ctx, a1, a2);
      return;
    case 3:
      while (++i < l) (ev = handlers[i]).callback.call(ev.ctx, a1, a2, a3);
      return;
    default:
      while (++i < l) (ev = handlers[i]).callback.apply(ev.ctx, args);
      return;
  }
}

function triggerApi(store, name, customArgs, args) {
  let handlers = store[name];
  callHandlers(handlers, [...args, customArgs]);
  if (name !== "all") callHandlers(store["all"], [name, ...args, customArgs]);
  return store;
}

export default function trigger(name, ...args) {
  if (!this._events) return this;
  if (typeof name === "object" && name != void 0) {
    iterateApi(triggerApi, this._events, name, args);
  } else {
    iterateApi(triggerApi, this._events, name, void 0, args);
  }
  return this;
}
