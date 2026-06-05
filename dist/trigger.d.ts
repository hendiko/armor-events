import type { ArmorEventsOwner } from "./types";
/**
 * 触发单个事件名对应的响应队列。
 */
declare function triggerApi(owner: ArmorEventsOwner, event: any, args: any[], async?: boolean): void;
/**
 * 触发一个或多个事件。
 */
declare function trigger(owner: ArmorEventsOwner, events: unknown, args: any[], async?: boolean): void;
export { trigger, triggerApi };
//# sourceMappingURL=trigger.d.ts.map