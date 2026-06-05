/*
 * @Author: Xavier Yin
 * @Date: 2019-09-20 15:57:07
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2020-07-25 13:11:58
 *
 * Utilities used by the event parser and registry implementation.
 */

export type EventName = string | number | symbol;
export type EventItem = string | symbol;
export type EventInput = EventName | EventInput[];
export type EventHandle = EventName | AnyFunction;
export type EventHandleInput = EventHandle | EventHandleInput[];
export type EventMap = Record<string, EventHandleInput> & {
  [key: symbol]: EventHandleInput;
};
export type AnyFunction = (...args: any[]) => any;

/**
 * 判断目标是否为 Symbol 类型。
 */
function isSymbol(obj: unknown): obj is symbol {
  return "symbol" === typeof obj;
}

/**
 * 判断目标是否为函数。
 */
function isFunction(obj: unknown): obj is AnyFunction {
  return "function" === typeof obj;
}

/**
 * 判断目标是否为数组。
 */
function isArray(obj: unknown): obj is unknown[] {
  return obj instanceof Array;
}

/**
 * 判断目标是否为字符串。
 */
function isString(obj: unknown): obj is string {
  return "string" === typeof obj;
}

/**
 * 使用 indexOf 保持原实现的相等判断语义。
 */
function includes<T>(arr: T[], item: T): boolean {
  return arr.indexOf(item) > -1;
}

/**
 * 去除字符串首尾空白字符。
 */
function trim(str: string): string {
  return str.replace(/^\s+|\s+$/g, "");
}

/**
 * 按连续空白字符拆分事件名字符串。
 */
function splitByWhitespace(str: string): string[] {
  return trim(str).split(/\s+/);
}

/**
 * 判断字符串中是否不包含空白字符。
 */
function hasNoWhitespace(str: string): boolean {
  return !/\s/.test(str);
}

/**
 * 向数组中追加唯一项；保持原实现对重复事件名/响应的去重行为。
 */
function addUniqueItem<T>(arr: T[], item: T): void {
  if (!includes(arr, item)) arr.push(item);
}

/**
 * 判断目标是否为 number 类型。
 */
function isNumber(obj: unknown): obj is number {
  return "number" === typeof obj;
}

/**
 * 判断目标是否为非数组 object。
 *
 * 注意：这里保持原实现行为，function 不被视为 object。
 */
function isObject(obj: unknown): obj is Record<PropertyKey, unknown> {
  return !!obj && typeof obj === "object" && !isArray(obj);
}

/**
 * 整理事件名称或响应参数，返回标准事件列表。
 *
 * 事件名称参数可以是 string、array、number、symbol 中任意一种，
 * 但合法的单一事件名称必须是 symbol 或者不含空格的非空字符串。
 */
function makeEventList(
  name: unknown,
  allowFn?: boolean,
  result: Array<EventItem | AnyFunction> = []
): Array<EventItem | AnyFunction> {
  if (isString(name)) {
    const trimmedName = trim(name);
    if (trimmedName) {
      // 单个无空白字符串直接加入；含空白字符串继续拆分。
      if (hasNoWhitespace(trimmedName)) {
        addUniqueItem(result, trimmedName);
      } else {
        makeEventList(splitByWhitespace(trimmedName), allowFn, result);
      }
    }
  } else if (isArray(name)) {
    // 数组允许嵌套，递归展开后仍保持去重。
    for (let i = 0; i < name.length; i++) {
      makeEventList(name[i], allowFn, result);
    }
  } else if (isNumber(name)) {
    // number 类型事件名沿用旧行为，转换成字符串事件名。
    makeEventList(name + "", allowFn, result);
  } else if (isSymbol(name)) {
    addUniqueItem(result, name);
  } else if (allowFn && isFunction(name)) {
    addUniqueItem(result, name);
  }
  return result;
}

/**
 * 获取 Plain Object 所有 property 名称（包括 Symbol Key）。
 */
function keys(obj: object): Array<string | symbol> {
  let names: Array<string | symbol> = Object.getOwnPropertySymbols
    ? Object.getOwnPropertySymbols(obj)
    : [];
  for (let k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      names.push(k);
    }
  }
  return names;
}

/**
 * 空操作函数，用作无事件绑定时返回的销毁函数。
 */
function noop(): void {}

let cacheId: Record<string, number> = {};

/**
 * 生成唯一 id。
 */
function uniqueId(salt: string): string {
  if (!Object.prototype.hasOwnProperty.call(cacheId, salt)) cacheId[salt] = 0;
  return salt + cacheId[salt]++;
}

/**
 * 判断当前环境是否支持 Symbol 类型。
 */
function canUseSymbol(): boolean {
  return typeof Symbol === "function";
}

export {
  canUseSymbol,
  includes,
  isFunction,
  isObject,
  isSymbol,
  keys,
  makeEventList,
  noop,
  uniqueId,
};
