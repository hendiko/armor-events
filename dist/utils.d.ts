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
declare function isSymbol(obj: unknown): obj is symbol;
/**
 * 判断目标是否为函数。
 */
declare function isFunction(obj: unknown): obj is AnyFunction;
/**
 * 使用 indexOf 保持原实现的相等判断语义。
 */
declare function includes<T>(arr: T[], item: T): boolean;
/**
 * 判断目标是否为非数组 object。
 *
 * 注意：这里保持原实现行为，function 不被视为 object。
 */
declare function isObject(obj: unknown): obj is Record<PropertyKey, unknown>;
/**
 * 整理事件名称或响应参数，返回标准事件列表。
 *
 * 事件名称参数可以是 string、array、number、symbol 中任意一种，
 * 但合法的单一事件名称必须是 symbol 或者不含空格的非空字符串。
 */
declare function makeEventList(name: unknown, allowFn?: boolean, result?: Array<EventItem | AnyFunction>): Array<EventItem | AnyFunction>;
/**
 * 获取 Plain Object 所有 property 名称（包括 Symbol Key）。
 */
declare function keys(obj: object): Array<string | symbol>;
/**
 * 空操作函数，用作无事件绑定时返回的销毁函数。
 */
declare function noop(): void;
/**
 * 生成唯一 id。
 */
declare function uniqueId(salt: string): string;
/**
 * 判断当前环境是否支持 Symbol 类型。
 */
declare function canUseSymbol(): boolean;
export { canUseSymbol, includes, isFunction, isObject, isSymbol, keys, makeEventList, noop, uniqueId, };
//# sourceMappingURL=utils.d.ts.map