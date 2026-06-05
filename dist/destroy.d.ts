import type { ArmorEventsOwner } from "./types";
/**
 * 销毁单个 handler，同时清理 owner 与 listener 两侧索引。
 */
declare function destroyApi(owner: ArmorEventsOwner, handlerId: string): void;
/**
 * 批量销毁 handler。
 */
declare function destroy(owner: ArmorEventsOwner, handlerIds: string[]): void;
export { destroy, destroyApi };
//# sourceMappingURL=destroy.d.ts.map