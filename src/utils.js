/*
 * @Author: Xavier Yin 
 * @Date: 2018-07-06 12:06:35 
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2018-07-18 23:21:35
 */

export const EVENT_SPLITTER = /\s+/;

// transform arguments into [object, options]
export function reduceArgs(key, value, options) {
  let obj = {};
  if ("object" === typeof key && key != void 0) {
    obj = key;
    options = value;
  } else if (null == key) {
    options = value;
  } else {
    obj[key] = value;
  }
  return [obj, options];
}

function _once(fn) {
  let called = false;
  return function() {
    if (called) return;
    called = true;
    return fn.apply(this, arguments);
  };
}

export function onceApi(store, name, callback, destroyer) {
  if (callback) {
    let once = (store[name] = _once(function() {
      destroyer(name, once);
      callback.apply(this, arguments);
    }));
    once._callback = callback;
  }
  return store;
}

export function iterateApi(iteratee, store, mapKey, mapValue, opts) {
  let key;
  let names;
  if (arguments.length < 5) {
    for (key in mapKey) {
      store = iterateApi(iteratee, store, key, mapKey[key], mapValue);
    }
  } else if ("string" === typeof mapKey && EVENT_SPLITTER.test(mapKey)) {
    names = mapKey.split(EVENT_SPLITTER);
    for (key in names) {
      store = iteratee(store, names[key], mapValue, opts);
    }
  } else {
    store = iteratee(store, mapKey, mapValue, opts);
  }
  return store;
}

let incre = 0;
export function uniqueId(salt) {
  return salt + incre++;
}

export function keys(obj) {
  let names = [];
  if (!obj) return names;
  for (let k in obj) {
    names.push(k);
  }
  return names;
}

export function bind(fn, ctx, ...args) {
  return function() {
    return fn.apply(ctx, [...args, ...arguments]);
  };
}
