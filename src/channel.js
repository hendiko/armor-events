/*
 * @Author: Xavier Yin
 * @Date: 2020-07-25 11:20:40
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2020-08-10 15:55:22
 */
import ArmorEvents from "./proto";

const channelId = ((incr) => () => "channel" + incr++)(0);

const bindingId = ((incr) => () => "binding" + incr++)(0);

const DATA_EVENT = "data";
const PIPE_EVENT = "pipe";

/**
 * 两个 channel 可以连通在一起
 */
class Channel {
  constructor() {
    this.id = channelId();
    this.events = new ArmorEvents();

    this.upstream = null;
    this.downstreams = {};

    this.bindings = {};
  }

  /**
   * 判断是否可以与 subchannel 建立管道
   * @param {channel} subchannel
   */
  canPipe(subchannel) {
    return !checkPipable(this, subchannel);
  }

  /**
   * 清空 channel，包括解除 upstream 和 downstream 连接
   * 清除所有 DATA_EVENT 事件响应
   */
  clean() {
    this.detach().unpipe().off();
    return this;
  }

  /**
   * 与 upstream 脱离
   */
  detach() {
    if (this.upstream) {
      if (this.upstream instanceof ArmorEvents) {
        this.upstream.off(null, this.feed, this);
        this.upstream = null;
      } else {
        this.upstream.unpipe(this);
      }
    }
    return this;
  }

  /**
   * 触发 DATA_EVENT 事件
   * @param  {...any} args
   */
  feed(...args) {
    this.events.trigger(DATA_EVENT, ...args);
    this.events.trigger(PIPE_EVENT, ...args);
    return this;
  }

  /**
   * 异步触发 DATA_EVENT 事件
   * @param  {...any} args
   */
  feedAsync(...args) {
    this.events.triggerAsync(DATA_EVENT, ...args);
    this.events.triggerAsync(PIPE_EVENT, ...args);
    return this;
  }

  /**
   * 绑定 DATA_EVENT 回调函数
   * @param {function} cb
   * @param {any} ctx
   */
  onData(cb, ctx) {
    const id = bindingId();
    const unbind = this.events.on(DATA_EVENT, cb, ctx);
    const unbind2 = () => {
      delete this.bindings[id];
      unbind();
    };
    const binding = { id, unbind: unbind2, cb, ctx };
    this.bindings[id] = binding;

    return unbind2;
  }

  /**
   * 绑定一次性 DATA_EVENT 回调函数
   * @param {function} cb
   * @param {any} ctx
   */
  onceData(cb, ctx) {
    const id = bindingId();

    const handler = (...args) => {
      cb.apply(ctx, args);
      unbind2();
    };

    const unbind = this.events.once(DATA_EVENT, handler, ctx);

    const unbind2 = () => {
      delete this.bindings[id];
      unbind();
    };

    const binding = { id, unbind: unbind2, cb, ctx };
    this.bindings[id] = binding;

    return unbind2;
  }

  /**
   * 清除 onData 回调
   * @param {function} cb
   * @param {any} ctx
   */
  off(cb, ctx) {
    let bindings = values(this.bindings);

    for (let i = 0; i < bindings.length; i++) {
      let { unbind, cb: _cb, ctx: _ctx } = bindings[i];
      if ((cb != null && cb !== _cb) || (ctx != null && ctx !== _ctx)) continue;
      unbind();
    }

    return this;
  }

  /**
   * 连通下一级 channel
   * @param {Channel} subchannel
   * @param {function} transform
   */
  pipe(subchannel, transform) {
    let errMsg = checkPipable(this, subchannel);

    if (errMsg) {
      throw Error(errMsg);
    } else {
      let unbind = this.events.on(PIPE_EVENT, (...args) => {
        if (typeof transform === "function") {
          Promise.resolve(transform(...args)).then((val) =>
            subchannel.feed(val)
          );
        } else {
          subchannel.feed(...args);
        }
      });

      let unbind2 = () => {
        delete this.downstreams[subchannel.id];
        subchannel.upstream = null;
        unbind();
      };

      this.downstreams[subchannel.id] = {
        id: subchannel.id,
        unbind: unbind2,
        channel: subchannel,
      };

      subchannel.upstream = this;
    }

    return this;
  }

  /**
   * 断开与下一级 channel 的连通
   */
  unpipe(...subchannels) {
    if (subchannels.length === 0)
      subchannels = values(this.downstreams).map((binding) => binding.channel);

    let ids = subchannels.map((channel) => {
      let id = channel ? channel.id : null;
      if (id) {
        let { unbind } = this.downstreams[id] || {};
        if (unbind) unbind();
      }
    });

    return this;
  }
}

const checkPipable = (channel, subchannel) => {
  if (subchannel.upstream) {
    throw "subchannel has already had an upstream channel.";
  } else if (channel.upstream && isSelfOrDescendant(subchannel, channel)) {
    throw "it can not be circular pipe.";
  }
  return false;
};

const values = (obj) => {
  let arr = [];
  for (let k in obj) {
    arr.push(obj[k]);
  }
  return arr;
};

const isSelfOrDescendant = (channel, subchannel) => {
  if (channel === subchannel) return true;
  if (channel.downstreams[subchannel.id]) return true;
  for (let k in channel.downstreams) {
    if (isSelfOrDescendant(channel.downstreams[k].channel, subchannel)) {
      return true;
    }
  }
  return false;
};

/**
 * 通过该方法得到的 Channel 对象，没有提供明确的解绑方法。
 * 但你可以通过 armorEvents.off(null, null, channel) 来进行解绑。
 */
ArmorEvents.prototype.channel = function (eventNames) {
  let channel = new Channel();

  channel.upstream = this;

  this.on(eventNames, channel.feed, channel);

  return channel;
};

export { Channel };

export default ArmorEvents;
