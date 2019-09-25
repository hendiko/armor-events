/*
 * @Author: Xavier Yin
 * @Date: 2019-09-20 15:57:07
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2019-09-24 18:16:18
 */

// 是否是 Symbol 对象
function isSymbol(obj) {
  return "symbol" === typeof obj;
}

function isFunction(obj) {
  return "function" === typeof obj;
}

function isArray(obj) {
  return obj instanceof Array;
}

function isString(obj) {
  return "string" === typeof obj;
}

function includes(arr, item) {
  return arr.indexOf(item) > -1;
}

function trim(str) {
  return str.replace(/^\s+|\s+$/g, "");
}

function splitByWhitespace(str) {
  return trim(str).split(/\s+/);
}

function hasNoWhitespace(str) {
  return !/\s/.test(str);
}

function addUniqueItem(arr, item) {
  if (!includes(arr, item)) arr.push(item);
}

function isNumber(obj) {
  return "number" === typeof obj;
}

function isObject(obj) {
  return obj && typeof obj === "object" && !isArray(obj);
}

/**
 * 整理事件名称，返回事件列表
 * @param {string|array|number|symbol} name 事件名称
 * @param {boolean} allowFn 列表中是否允许包含 Function 类型
 * @param {array} [result] 事件列表（内部递归时传入）
 *
 * 事件名称参数可以是 string|array|number|symbol 中任意一种，
 * 但合法的单一事件名称必须是 symbol 或者不含空格的非空字符串。
 */
function makeEventList(name, allowFn, result = []) {
  if (isString(name)) {
    name = trim(name);
    if (name) {
      if (hasNoWhitespace(name)) {
        addUniqueItem(result, name);
      } else {
        makeEventList(splitByWhitespace(name), allowFn, result);
      }
    }
  } else if (isArray(name)) {
    for (let i = 0; i < name.length; i++) {
      makeEventList(name[i], allowFn, result);
    }
  } else if (isNumber(name)) {
    makeEventList(name + "", allowFn, result);
  } else if (isSymbol(name)) {
    addUniqueItem(result, name);
  } else if (allowFn && isFunction(name)) {
    addUniqueItem(result, name);
  }
  return result;
}

// 获取 Plain Object 所有 property 名称（包括 Symbol Key）
function keys(obj) {
  let names = Object.getOwnPropertySymbols
    ? Object.getOwnPropertySymbols(obj)
    : [];
  for (let k in obj) {
    if (obj.hasOwnProperty(k)) {
      names.push(k);
    }
  }
  return names;
}

function noop() {}

let cacheId = {};

// 生成唯一id
function uniqueId(salt) {
  if (!cacheId.hasOwnProperty(salt)) cacheId[salt] = 0;
  return salt + cacheId[salt]++;
}

export {
  includes,
  isFunction,
  isObject,
  isSymbol,
  keys,
  makeEventList,
  noop,
  uniqueId
};
