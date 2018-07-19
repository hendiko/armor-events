/*
 * @Author: Xavier Yin 
 * @Date: 2018-07-06 11:48:20 
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2018-07-18 22:04:51
 */

import { uniqueId } from "./utils";

// 事件分隔符
export const EVENT_SPLITTER = /\s+/;

// 生成 listenId
export const createListenId = () => uniqueId("l");

export function Listening({
  listenId, // 监听者的 listenId
  listeningTo, // 监听者监听活动存储空间
  target, // 被监听对象
  targetListenId, // 被监听对象的 listenId
  count = 0 // 监听次数
}) {
  return {
    count,
    id: listenId,
    listeningTo,
    obj: target,
    objId: targetListenId
  };
}

export const ACTION_FORWARD = "forward";
export const ACTION_LISTEN = "listen";
