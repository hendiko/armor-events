/*
 * @Author: Xavier Yin
 * @Date: 2019-09-20 18:18:30
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2019-10-01 00:57:26
 */
import { uniqueId } from "./utils";

/**
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
 *
 */

function checkOwner(owner) {
  if (!owner._armorEvents) {
    owner._armorEvents = {
      id: uniqueId("a"),
      events: {},
      handlers: {},
      listenings: {}
    };
  }
}

export { checkOwner };
