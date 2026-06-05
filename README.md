# armor-events

`armor-events` 是一个为任意对象提供事件能力的 JavaScript/TypeScript 库。它的接口受 Backbone Events 启发，同时增加了事件转发、异步触发和 `Channel` 数据通道。

> 警告：`Channel` 及其相关 API 目前属于实验性能力。它的类名、方法名、参数签名、生命周期语义、pipe 传递行为和错误处理策略都可能在后续版本调整。调用者在生产环境或公共 API 中使用前，应自行评估兼容性风险。

## 安装

```bash
npm install armor-events
```

## 加载方式

ESM：

```ts
import ArmorEvents, { Channel } from "armor-events";
```

CommonJS：

```js
const ArmorEvents = require("armor-events");
const { Channel } = require("armor-events");
```

浏览器全局变量：

```html
<script src="./dist/armor-events.umd.js"></script>
<script>
  const events = ArmorEvents();
</script>
```

## 基本用法

创建纯事件对象：

```ts
import ArmorEvents from "armor-events";

const events = ArmorEvents();
```

混入已有对象：

```ts
const foo = {
  count: 0,
  add() {
    this.count++;
  },
};

ArmorEvents(foo);

const destroy = foo.on("add", foo.add);
foo.trigger("add");
destroy();
```

作为构造函数：

```ts
const events = new ArmorEvents();
events.on("ready", () => {});
```

作为静态事件对象：

```ts
ArmorEvents.on("global-event", () => {});
ArmorEvents.trigger("global-event");
```

> 注意：`ArmorEvents` 本身也可以绑定事件。如果再通过 `Object.assign({}, ArmorEvents)` 把它当作 API Provider 使用，已有内部事件状态也可能被复制到新对象上，应避免混用。

## 事件名和响应参数

单个事件名可以是：

- 不含空白字符的非空字符串
- `number`，会转换成字符串
- `symbol`

事件名参数可以是字符串、数字、symbol、数组或嵌套数组。

```ts
events.on("hello world", callback);
events.on(["foo bar", Symbol("x"), 100], callback);
```

响应参数可以是函数，也可以是另一个事件名。响应是事件名时表示事件转发。

```ts
events.on("request", "loading");
events.on("loading", () => {
  console.log("loading");
});

events.trigger("request");
```

## API

### `ArmorEvents(target?)`

签名：

```ts
function ArmorEvents(target?: object | Function | null): ArmorEventsInstance;
new ArmorEvents(): ArmorEventsInstance;
```

参数：

- `target`：可选。需要混入事件 API 的对象或函数。

返回值：

- 调用 `ArmorEvents(target)` 时返回已混入事件 API 的对象。
- 调用 `ArmorEvents()` 时返回新的纯事件对象。
- 调用 `new ArmorEvents()` 时返回事件实例。

示例：

```ts
const a = ArmorEvents();
const b = ArmorEvents({ name: "b" });
const c = new ArmorEvents();
```

### `on(events, handles, ctx?)`

签名：

```ts
on(events: EventInput | EventMap, handles?: EventHandleInput, ctx?: any): () => void
```

参数：

- `events`：事件名、事件名数组、嵌套数组，或事件 map。
- `handles`：响应函数、转发事件名、数组或嵌套数组。`events` 为事件 map 时，该参数表示 `ctx`。
- `ctx`：可选。函数响应的 `this` 上下文；不传时默认为当前事件对象。

返回值：

- 返回解绑函数。调用该函数会解除本次 `on` 创建的所有绑定。

示例：

```ts
const destroy = events.on("hello world", (value) => {
  console.log(value);
});

events.trigger("hello", 1);
events.trigger("world", 2);

destroy();
```

事件 map：

```ts
events.on({
  hello: () => console.log("hello"),
  world: () => console.log("world"),
});
```

事件转发：

```ts
events.on("request", "loading");
events.on("loading", () => console.log("loading"));
events.trigger("request");
```

### `once(events, handles, ctx?)`

签名：

```ts
once(events: EventInput | EventMap, handles?: EventHandleInput, ctx?: any): () => void
```

参数与 `on` 相同。

返回值：

- 返回解绑函数。

行为：

- 绑定的响应首次触发前会先自动解绑，然后再执行响应。

示例：

```ts
events.once("ready", () => console.log("ready once"));

events.trigger("ready");
events.trigger("ready");
```

### `listenTo(target, events, handles, ctx?)`

签名：

```ts
listenTo(
  target: ArmorEventsInstance,
  events: EventInput | EventMap,
  handles?: EventHandleInput,
  ctx?: any
): () => void
```

参数：

- `target`：被监听对象，必须具有 `armor-events` 事件 API。
- `events`：被监听事件名、事件名数组、嵌套数组，或事件 map。
- `handles`：响应函数、转发事件名、数组或嵌套数组。`events` 为事件 map 时，该参数表示 `ctx`。
- `ctx`：可选。函数响应上下文；不传时默认为当前监听对象。

返回值：

- 返回解绑函数。调用该函数会解除本次监听。

示例：

```ts
const listener = ArmorEvents();
const target = ArmorEvents();

const destroy = listener.listenTo(target, "change", (value) => {
  console.log(value);
});

target.trigger("change", 1);
destroy();
```

监听并转发到 listener 自身：

```ts
listener.listenTo(target, "change", "local-change");
listener.on("local-change", () => console.log("forwarded"));

target.trigger("change");
```

### `listenToOnce(target, events, handles, ctx?)`

签名：

```ts
listenToOnce(
  target: ArmorEventsInstance,
  events: EventInput | EventMap,
  handles?: EventHandleInput,
  ctx?: any
): () => void
```

参数与 `listenTo` 相同。

返回值：

- 返回解绑函数。

行为：

- 响应首次触发前会自动解除本次监听。

示例：

```ts
listener.listenToOnce(target, "done", () => console.log("done once"));

target.trigger("done");
target.trigger("done");
```

### `off(events?, handles?, ctx?)`

签名：

```ts
off(events?: EventInput | null, handles?: EventHandleInput | null, ctx?: any): this
```

参数：

- `events`：可选。限定要解绑的事件名；`null` 或 `undefined` 表示不限定事件名。
- `handles`：可选。限定要解绑的响应函数或转发事件名；`null` 或 `undefined` 表示不限定响应。
- `ctx`：可选。限定上下文；`null` 或 `undefined` 表示不限定上下文。

返回值：

- 返回当前事件对象。

示例：

```ts
events.off("change");
events.off(null, callback);
events.off(null, null, context);
events.off();
```

注意：

- `off()` 解除的事件如果来自其他对象的 `listenTo`，会同步清理监听者上的监听索引。

### `stopListening(target?, events?, handles?, ctx?)`

签名：

```ts
stopListening(
  target?: ArmorEventsInstance | null,
  events?: EventInput | null,
  handles?: EventHandleInput | null,
  ctx?: any
): this
```

参数：

- `target`：可选。限定被监听对象；不传时匹配所有被监听对象。
- `events`：可选。限定事件名。
- `handles`：可选。限定响应函数或转发事件名。
- `ctx`：可选。限定上下文。

返回值：

- 返回当前监听对象。

示例：

```ts
listener.stopListening(target, "change");
listener.stopListening(target);
listener.stopListening();
```

### `trigger(events, ...args)`

签名：

```ts
trigger(events: EventInput, ...args: any[]): this
```

参数：

- `events`：要触发的事件名、事件名数组或嵌套数组。
- `args`：传给响应函数或转发事件的参数。

返回值：

- 返回当前事件对象。

行为：

- 同步逐一执行响应。
- 触发非 `all` 事件后，会在同一对象上触发一次 `all` 事件，`all` 响应接收 `(eventName, ...args)`。

示例：

```ts
events.on("all", (eventName, value) => {
  console.log(eventName, value);
});

events.trigger("change", 1);
```

### `triggerAsync(events, ...args)`

签名：

```ts
triggerAsync(events: EventInput, ...args: any[]): this
```

参数与 `trigger` 相同。

返回值：

- 返回当前事件对象。

行为：

- 使用 `setTimeout` 异步调度响应，不返回 Promise。

示例：

```ts
events.triggerAsync("change", 1);
```

### `channel(events)`

> 警告：`channel(events)` 是实验性 API。返回的 `Channel` 连接方式和解绑方式可能在后续版本调整。

签名：

```ts
channel(events: EventInput): Channel
```

参数：

- `events`：要接入 Channel 的事件名。

返回值：

- 返回新的 `Channel` 实例。

示例：

```ts
const events = new ArmorEvents();
const channel = events.channel("message");

channel.onData((message) => {
  console.log(message);
});

events.trigger("message", "hello");
```

更多 `Channel` API 见 [docs/Channel.md](./docs/Channel.md)。
