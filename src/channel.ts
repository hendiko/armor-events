/*
 * @Author: Xavier Yin
 * @Date: 2020-07-25 11:20:40
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2020-08-10 15:55:22
 *
 * Channel provides a single data event surface built on ArmorEvents.
 *
 * Warning: Channel and all Channel APIs are experimental. Their names,
 * signatures, lifecycle semantics, pipe behavior and error handling may change
 * in future releases. Callers should evaluate this risk before depending on
 * Channel in stable public interfaces.
 */
import ArmorEvents from "./proto";
import type { ArmorEventsInstance } from "./types";
import type { AnyFunction, EventInput } from "./utils";

const channelId = ((incr) => () => "channel" + incr++)(0);

const bindingId = ((incr) => () => "binding" + incr++)(0);

const DATA_EVENT = "data";
const PIPE_EVENT = "pipe";

interface ChannelBinding {
  id: string;
  unbind: () => void;
  cb: AnyFunction;
  ctx: any;
}

interface DownstreamBinding {
  id: string;
  unbind: () => void;
  channel: Channel;
}

/**
 * 两个 channel 可以连通在一起。
 *
 * 警告：Channel 目前是实验性 API，类名、方法名、参数签名、生命周期语义、
 * pipe 传递行为和错误处理策略都可能在后续版本调整。调用者在生产或公共
 * API 中使用前，应自行评估兼容性风险。
 *
 * @experimental
 */
class Channel {
  id: string;
  events: ArmorEventsInstance;
  upstream: Channel | ArmorEventsInstance | null;
  downstreams: Record<string, DownstreamBinding>;
  bindings: Record<string, ChannelBinding>;

  /**
   * 创建一个单一数据通道。
   *
   * 警告：Channel 构造方式和公开属性可能随后续版本调整。
   *
   * @experimental
   */
  constructor() {
    this.id = channelId();
    this.events = new ArmorEvents();

    this.upstream = null;
    this.downstreams = {};

    this.bindings = {};
  }

  /**
   * 判断是否可以与 subchannel 建立管道。
   *
   * 警告：canPipe 的返回/异常语义可能调整；调用者不要把当前行为视为稳定契约。
   *
   * @experimental
   */
  canPipe(subchannel: Channel): boolean {
    return !checkPipable(this, subchannel);
  }

  /**
   * 清空 channel，包括解除 upstream 和 downstream 连接。
   * 清除所有 DATA_EVENT 事件响应。
   *
   * 警告：clean 的清理范围和生命周期语义可能调整。
   *
   * @experimental
   */
  clean(): this {
    this.detach().unpipe().off();
    return this;
  }

  /**
   * 与 upstream 脱离。
   *
   * 警告：detach 对 ArmorEvents upstream 和 Channel upstream 的解绑策略可能调整。
   *
   * @experimental
   */
  detach(): this {
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
   * 触发 DATA_EVENT 事件。
   *
   * 警告：feed 的同步触发顺序、pipe 联动和参数传递规则可能调整。
   *
   * @experimental
   */
  feed(...args: any[]): this {
    this.events.trigger(DATA_EVENT, ...args);
    this.events.trigger(PIPE_EVENT, ...args);
    return this;
  }

  /**
   * 异步触发 DATA_EVENT 事件。
   *
   * 警告：feedAsync 当前不返回 Promise；后续异步语义可能调整。
   *
   * @experimental
   */
  feedAsync(...args: any[]): this {
    this.events.triggerAsync(DATA_EVENT, ...args);
    this.events.triggerAsync(PIPE_EVENT, ...args);
    return this;
  }

  /**
   * 绑定 DATA_EVENT 回调函数。
   *
   * 警告：onData 的命名、上下文语义和返回的解绑函数形式可能调整。
   *
   * @experimental
   */
  onData(cb: AnyFunction, ctx?: any): () => void {
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
   * 绑定一次性 DATA_EVENT 回调函数。
   *
   * 警告：onceData 的解绑时机、上下文语义和返回值形式可能调整。
   *
   * @experimental
   */
  onceData(cb: AnyFunction, ctx?: any): () => void {
    const id = bindingId();

    const handler = (...args: any[]) => {
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
   * 清除 onData 回调。
   *
   * 警告：off 当前只清理 data 回调，不清理 pipe/upstream/downstream；
   * 后续清理范围可能调整。
   *
   * @experimental
   */
  off(cb?: AnyFunction | null, ctx?: any): this {
    let bindings = values(this.bindings);

    for (let i = 0; i < bindings.length; i++) {
      let { unbind, cb: _cb, ctx: _ctx } = bindings[i];
      // cb 或 ctx 为空时表示该条件不限。
      if ((cb != null && cb !== _cb) || (ctx != null && ctx !== _ctx)) continue;
      unbind();
    }

    return this;
  }

  /**
   * 连通下一级 channel。
   *
   * 警告：pipe 的 transform 语义、同步/异步传递规则、环路检查和错误处理
   * 可能调整。调用者应避免把当前实现细节暴露为自己的稳定 API。
   *
   * @experimental
   */
  pipe(subchannel: Channel, transform?: (...args: any[]) => any): this {
    let errMsg = checkPipable(this, subchannel);

    if (errMsg) {
      throw Error(errMsg);
    } else {
      let unbind = this.events.on(PIPE_EVENT, (...args: any[]) => {
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
   * 断开与下一级 channel 的连通。
   *
   * 警告：unpipe 的参数匹配方式和 downstream 清理策略可能调整。
   *
   * @experimental
   */
  unpipe(...subchannels: Channel[]): this {
    if (subchannels.length === 0)
      subchannels = values(this.downstreams).map((binding) => binding.channel);

    subchannels.map((channel) => {
      let id = channel ? channel.id : null;
      if (id) {
        let { unbind } = this.downstreams[id] || {};
        if (unbind) unbind();
      }
    });

    return this;
  }
}

/**
 * 检查两个 channel 是否可以建立管道。
 *
 * 注意：这里保留原实现行为，非法情况会 throw 字符串，canPipe 也会透传异常。
 */
const checkPipable = (channel: Channel, subchannel: Channel): false => {
  if (subchannel.upstream) {
    throw "subchannel has already had an upstream channel.";
  } else if (channel.upstream && isSelfOrDescendant(subchannel, channel)) {
    throw "it can not be circular pipe.";
  }
  return false;
};

/**
 * 获取对象枚举值列表。
 */
const values = <T>(obj: Record<string, T>): T[] => {
  let arr: T[] = [];
  for (let k in obj) {
    arr.push(obj[k]);
  }
  return arr;
};

/**
 * 判断 subchannel 是否为 channel 自身或其下游后代。
 */
const isSelfOrDescendant = (channel: Channel, subchannel: Channel): boolean => {
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
 *
 * 警告：channel(events) 是实验性 API，返回的 Channel 连接方式和解绑方式
 * 可能在后续版本调整。
 *
 * @experimental
 */
ArmorEvents.prototype.channel = function (this: ArmorEventsInstance, eventNames: EventInput): Channel {
  let channel = new Channel();

  channel.upstream = this;

  this.on(eventNames, channel.feed, channel);

  return channel;
};

export { Channel };

export default ArmorEvents;
