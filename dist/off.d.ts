import type { ArmorEventsOwner } from "./types";
/**
 * 解绑 owner 上符合条件的事件响应。
 */
declare function off(owner: ArmorEventsOwner, events?: unknown, handles?: unknown, ctx?: any): void;
/**
 * 停止 listener 对 target 的监听。
 */
declare function stopListening(listener: ArmorEventsOwner, target?: unknown, events?: unknown, handles?: unknown, ctx?: any): void;
export { off, stopListening };
//# sourceMappingURL=off.d.ts.map