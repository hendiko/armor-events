/*
 * @Author: Xavier Yin
 * @Date: 2019-09-20 17:32:35
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2020-07-28 14:02:44
 *
 * armorEvents 结构：
 * {
 *  id: string,
 *  events: {
 *    [event]: [handler.id]
 *  },
 *  handlers: {
 *    [handler.id]: handler
 *  },
 *  listenings: {
 *    [target.id]: {
 *      target,
 *      events: {
 *        [event]: [handler.id]
 *      }
 *    }
 *  }  // target.id 为 target._armorEvents.id
 * }
 *
 * handler 结构：
 * {
 *  id: string,
 *  event: string,
 *  handle: function|string|symbol,
 *  ctx: object,
 *  once: boolean,
 *  listener: object,
 *  disabled: boolean
 * }
 */

import ArmorEvents, { Channel } from "./channel";

ArmorEvents.Channel = Channel;

export { Channel };

export default ArmorEvents;
module.exports = ArmorEvents;
