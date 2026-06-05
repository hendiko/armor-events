import type { ArmorEventsOwner } from "./types";
/**
 * listenTo/listenToOnce 的内部入口，支持事件 map 和普通参数两种形式。
 */
declare function listenTo(listener: ArmorEventsOwner, owner: ArmorEventsOwner, events: unknown, handles: unknown, ctx?: any, once?: boolean): string[];
export { listenTo };
//# sourceMappingURL=listen.d.ts.map