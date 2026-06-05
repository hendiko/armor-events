import type { ArmorEventsOwner } from "./types";
/**
 * 确保 owner 拥有内部事件状态。
 *
 * listening
 *
 * listener 主动停止监听
 *
 * 通过 listener.listenings 解除对应 target 的监听
 *
 * target 主动停止监听
 *
 * 在 events, handlers 中删除相关 handler，通过 listeners
 * 找到 listener, 移除相关绑定
 */
declare function checkOwner(owner: ArmorEventsOwner): void;
export { checkOwner };
//# sourceMappingURL=check.d.ts.map