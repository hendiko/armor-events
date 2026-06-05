import ArmorEvents from "./proto";
import type { ArmorEventsInstance } from "./types";
import type { AnyFunction } from "./utils";
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
declare class Channel {
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
    constructor();
    /**
     * 判断是否可以与 subchannel 建立管道。
     *
     * 警告：canPipe 的返回/异常语义可能调整；调用者不要把当前行为视为稳定契约。
     *
     * @experimental
     */
    canPipe(subchannel: Channel): boolean;
    /**
     * 清空 channel，包括解除 upstream 和 downstream 连接。
     * 清除所有 DATA_EVENT 事件响应。
     *
     * 警告：clean 的清理范围和生命周期语义可能调整。
     *
     * @experimental
     */
    clean(): this;
    /**
     * 与 upstream 脱离。
     *
     * 警告：detach 对 ArmorEvents upstream 和 Channel upstream 的解绑策略可能调整。
     *
     * @experimental
     */
    detach(): this;
    /**
     * 触发 DATA_EVENT 事件。
     *
     * 警告：feed 的同步触发顺序、pipe 联动和参数传递规则可能调整。
     *
     * @experimental
     */
    feed(...args: any[]): this;
    /**
     * 异步触发 DATA_EVENT 事件。
     *
     * 警告：feedAsync 当前不返回 Promise；后续异步语义可能调整。
     *
     * @experimental
     */
    feedAsync(...args: any[]): this;
    /**
     * 绑定 DATA_EVENT 回调函数。
     *
     * 警告：onData 的命名、上下文语义和返回的解绑函数形式可能调整。
     *
     * @experimental
     */
    onData(cb: AnyFunction, ctx?: any): () => void;
    /**
     * 绑定一次性 DATA_EVENT 回调函数。
     *
     * 警告：onceData 的解绑时机、上下文语义和返回值形式可能调整。
     *
     * @experimental
     */
    onceData(cb: AnyFunction, ctx?: any): () => void;
    /**
     * 清除 onData 回调。
     *
     * 警告：off 当前只清理 data 回调，不清理 pipe/upstream/downstream；
     * 后续清理范围可能调整。
     *
     * @experimental
     */
    off(cb?: AnyFunction | null, ctx?: any): this;
    /**
     * 连通下一级 channel。
     *
     * 警告：pipe 的 transform 语义、同步/异步传递规则、环路检查和错误处理
     * 可能调整。调用者应避免把当前实现细节暴露为自己的稳定 API。
     *
     * @experimental
     */
    pipe(subchannel: Channel, transform?: (...args: any[]) => any): this;
    /**
     * 断开与下一级 channel 的连通。
     *
     * 警告：unpipe 的参数匹配方式和 downstream 清理策略可能调整。
     *
     * @experimental
     */
    unpipe(...subchannels: Channel[]): this;
}
export { Channel };
export default ArmorEvents;
//# sourceMappingURL=channel.d.ts.map