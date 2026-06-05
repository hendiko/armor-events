# Channel

`Channel` 是 `armor-events` 提供的单一数据通道。它内部使用 `ArmorEvents` 管理 `data` 和 `pipe` 两个事件，向外提供 `feed`、`onData`、`pipe` 等数据流式 API。

> 警告：`Channel` 及其全部 API 当前属于实验性能力。类名、方法名、参数签名、生命周期语义、同步/异步规则、pipe 传递行为、transform 规则、解绑方式和错误处理策略都可能在后续版本调整。调用者在生产环境或公共 API 中使用前，应自行评估兼容性风险。

## 创建 Channel

ESM：

```ts
import { Channel } from "armor-events";

const channel = new Channel();
```

CommonJS：

```js
const ArmorEvents = require("armor-events");

const channel = new ArmorEvents.Channel();
```

通过事件对象创建：

```ts
import ArmorEvents from "armor-events";

const events = new ArmorEvents();
const channel = events.channel("message");
```

## API

### `new Channel()`

> 警告：构造方式和公开属性可能在后续版本调整。

签名：

```ts
new Channel(): Channel
```

返回值：

- 返回新的单一数据通道。

示例：

```ts
const channel = new Channel();
```

### `canPipe(subchannel)`

> 警告：当前实现中非法 pipe 场景可能抛异常；后续返回/异常语义可能调整。

签名：

```ts
canPipe(subchannel: Channel): boolean
```

参数：

- `subchannel`：准备作为下游的 Channel。

返回值：

- 理论上返回是否可以建立管道。

注意：

- 当前实现中，非法 pipe 场景会透传内部异常，而不是始终返回布尔值。这里保持现有行为。

示例：

```ts
if (channel.canPipe(nextChannel)) {
  channel.pipe(nextChannel);
}
```

### `clean()`

> 警告：清理范围和生命周期语义可能在后续版本调整。

签名：

```ts
clean(): Channel
```

返回值：

- 返回当前 Channel。

行为：

- 等价于 `channel.detach().unpipe().off()`。
- 解除 upstream、所有 downstream，以及所有 `onData` 绑定。

示例：

```ts
channel.clean();
```

### `detach()`

> 警告：对 ArmorEvents upstream 和 Channel upstream 的解绑策略可能在后续版本调整。

签名：

```ts
detach(): Channel
```

返回值：

- 返回当前 Channel。

行为：

- 断开当前 Channel 与 upstream 的连接。
- upstream 可以是另一个 Channel，也可以是通过 `ArmorEvents.prototype.channel()` 连接的事件对象。

示例：

```ts
channel.detach();
```

### `feed(...args)`

> 警告：同步触发顺序、pipe 联动和参数传递规则可能在后续版本调整。

签名：

```ts
feed(...args: any[]): Channel
```

参数：

- `args`：传给 `onData` 回调和 downstream Channel 的数据。

返回值：

- 返回当前 Channel。

行为：

- 同步触发当前 Channel 的 `data` 响应。
- 同步触发 pipe 传递。

示例：

```ts
channel.onData((a, b) => {
  console.log(a, b);
});

channel.feed(1, 2);
```

### `feedAsync(...args)`

> 警告：当前不返回 Promise；后续异步语义可能调整。

签名：

```ts
feedAsync(...args: any[]): Channel
```

参数：

- `args`：传给 `onData` 回调和 downstream Channel 的数据。

返回值：

- 返回当前 Channel。

行为：

- 使用 `triggerAsync` 异步触发 `data` 和 `pipe` 响应。
- 不返回 Promise。

示例：

```ts
channel.feedAsync("hello");
```

### `onData(cb, ctx?)`

> 警告：命名、上下文语义和返回的解绑函数形式可能在后续版本调整。

签名：

```ts
onData(cb: (...args: any[]) => any, ctx?: any): () => void
```

参数：

- `cb`：接收数据的回调函数。
- `ctx`：可选。回调函数上下文。

返回值：

- 返回解绑函数。

示例：

```ts
const off = channel.onData(function (value) {
  console.log(this, value);
}, context);

channel.feed(1);
off();
```

### `onceData(cb, ctx?)`

> 警告：解绑时机、上下文语义和返回值形式可能在后续版本调整。

签名：

```ts
onceData(cb: (...args: any[]) => any, ctx?: any): () => void
```

参数：

- `cb`：接收数据的回调函数。
- `ctx`：可选。回调函数上下文。

返回值：

- 返回解绑函数。

行为：

- 回调首次触发后自动解绑。

示例：

```ts
channel.onceData((value) => {
  console.log(value);
});

channel.feed(1);
channel.feed(2);
```

### `off(cb?, ctx?)`

> 警告：当前只解除 data 回调，不解除 pipe/downstream/upstream；后续清理范围可能调整。

签名：

```ts
off(cb?: ((...args: any[]) => any) | null, ctx?: any): Channel
```

参数：

- `cb`：可选。限定要解绑的 `onData`/`onceData` 回调；`null` 或 `undefined` 表示不限定回调。
- `ctx`：可选。限定上下文；`null` 或 `undefined` 表示不限定上下文。

返回值：

- 返回当前 Channel。

行为：

- 只解除 data 回调，不解除 pipe/downstream/upstream。

示例：

```ts
channel.off(callback);
channel.off(null, context);
channel.off();
```

### `pipe(subchannel, transform?)`

> 警告：transform 语义、同步/异步传递规则、环路检查和错误处理策略可能在后续版本调整。

签名：

```ts
pipe(subchannel: Channel, transform?: (...args: any[]) => any): Channel
```

参数：

- `subchannel`：下游 Channel。
- `transform`：可选。转换函数，接收当前 Channel feed 的参数。

返回值：

- 返回当前 Channel。

行为：

- 未传 `transform` 时，原样把所有参数传给下游 `subchannel.feed(...args)`。
- 传入 `transform` 时，执行 `Promise.resolve(transform(...args)).then((val) => subchannel.feed(val))`，下游只接收 transform 返回的单个值。

示例：

```ts
const source = new Channel();
const target = new Channel();

target.onData((value) => {
  console.log(value);
});

source.pipe(target, (value) => value + 1);
source.feed(1);
```

### `unpipe(...subchannels)`

> 警告：参数匹配方式和 downstream 清理策略可能在后续版本调整。

签名：

```ts
unpipe(...subchannels: Channel[]): Channel
```

参数：

- `subchannels`：可选。要断开的下游 Channel。不传时断开全部 downstream。

返回值：

- 返回当前 Channel。

示例：

```ts
source.unpipe(target);
source.unpipe();
```

## 管道链示例

```ts
const c1 = new Channel();
const c2 = new Channel();
const c3 = new Channel();

c1.pipe(c2).pipe(c3);

c3.onData((value) => {
  console.log(value);
});

c1.feed("hello");
```

## 从 ArmorEvents 接入 Channel

> 警告：`events.channel(eventNames)` 的连接方式和解绑方式可能在后续版本调整。

```ts
const events = new ArmorEvents();
const channel = events.channel("message");

channel.onData((message) => {
  console.log(message);
});

events.trigger("message", "hello");

channel.detach();
```
