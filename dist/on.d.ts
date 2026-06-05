import type { ArmorEventsOwner } from "./types";
/**
 * 绑定单个事件和单个响应，并返回新建 handler id。
 */
declare function onApi(owner: ArmorEventsOwner, event: any, handle: any, ctx: any, once?: boolean, listener?: ArmorEventsOwner): string;
/**
 * on/once 的内部入口，支持事件 map 和普通参数两种形式。
 */
declare function on(owner: ArmorEventsOwner, events: unknown, handles: unknown, ctx?: any, once?: boolean): string[];
export { on, onApi };
//# sourceMappingURL=on.d.ts.map