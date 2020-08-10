# 简介

`armor-events` 是一个为任意对象提供事件能力的 JavaScript 库。

# 安装

```js
npm install armor-events
```

# 用法

`armor-events` 提供了 8 个 Api 用于操作事件，分别是：

| API             | 释义               |
| --------------- | ------------------ |
| `on`            | 事件绑定           |
| `once`          | 一次性事件绑定     |
| `listenTo`      | 事件监听           |
| `listenToOnce`  | 一次性事件监听     |
| `stopListening` | 停止事件监听       |
| `off`           | 事件解绑           |
| `trigger`       | 触发事件，同步响应 |
| `triggerAsync`  | 触发事件，异步响应 |

`ArmorEvents` 使用方法主要分为两种：

#### 一、创建纯事件对象

```js
import ArmorEvents from "armor-events";

// 创建一个可操作事件的对象
let events = ArmorEvents();
```

像 `events` 这种纯事件对象，一般用来充当事件分发器。

#### 二、混入已有对象

```js
// 将事件 Api 混入一个任意对象，使之具有操作事件的能力
let foo = {
  doSomething() {},
};
ArmorEvents(foo);
```

操作事件示例：

```js
// 事件绑定
let unbindSomeEvent = foo.on("some-event", foo.doSomething);

// 事件监听
let unbindAnotherEvent = foo.listenTo(events, "another-event", foo.doSomething);

// foo.doSomething() 将被调用
events.trigger("another-event");

// 解除事件监听
foo.stopListening(events, "another-event");
// 或者调用解除监听函数
unbindAnotherEvent();

// 解除事件绑定
foo.off("some-event");
// 或者调用解绑函数解除绑定
unbindSomeEvent();
```

> 注意：`armor-events` 提供的函数 `ArmorEvents(obj)` 本身具有事件能力，可以直接作为事件分发器使用。

```js
ArmorEvents.on("something", doSomething);

ArmorEvents.trigger("something");
```

以下 `ArmorEvents` 使用方式都是可行的：

```js
// 作为类，使用 new 操作符。作为构造函数时，ArmorEvents 不接受任何参数。
let bar = new ArmorEvents();
// 作为工厂函数
let bee = ArmorEvents({ name: "bee" });
// 作为 Api Provider
let noo = Object.assign({ name: "noo" }, ArmorEvents);
```

> 当 `ArmorEvents` 作为 Api Provider 时应注意，如果 `ArmorEvents` 已经充当了事件分发器，当使用 `Object.assign({}, ArmorEvents)` 时，`ArmorEvents` 自身已绑定的事件会一并复制到新对象上，因此应当避免 `ArmorEvents` 同时充当事件分发器和 Api Provider。

# API

## on(events, handles, ctx)

- `@param {string|symbol|number|array|object} events` 事件名称
- `@param {string|symbol|number|array|function} handles` 事件响应
- `@param {object} [ctx]` 事件回调函数上下文

在 `armor-events` 中，单个事件名称(event)只能是一个 Symbol 对象，或者是一个不含空格的非空字符串。单个事件响应(handle)只能是一个回调函数，或者是一个事件名称(event)。

参数 `events` 可以是 string、symbol、number、array、object 中任意一种。它用来指定需要绑定的事件名称，它最终会转换成一个或多少事件名称(event)。

| `events` 参数值                              | 转换后事件名称                                    |
| -------------------------------------------- | ------------------------------------------------- |
| "foo bar lee"                                | ["foo", "bar", "lee"]                             |
| ["foo bar", Symbol(0), 100, ["hello world"]] | ["foo", "bar", Symbol(0), "100", "hello", "world] |

> 如果参数 `events` 是一个 Plan Object，那么 `on` 接收的参数格式为 `on({[events]: handles}, ctx)`。

参数 `handles` 可以是 string、symbol、number、array、function 中任意一种，无论是哪一个类型的参数，它最后都会转换为一个或多个事件名称或回调函数。

如果 `handle` 是一个回调函数，当响应的事件被触发时，该回调函数会被调用。如果 `handle` 是一个事件名称，当响应的事件被触发时，事件参数会被转发到该 `handle` 事件上。

```js
foo.on("hello", [foo.doSomething, "world"]);

// 此时 foo.doSomething 被调用，
// 然后 foo 触发 "world" 事件，即 foo.trigger("world", 200);
foo.trigger("hello", 200);
```

可选参数 `ctx` 用作 `handle` 为回调函数时的上下文。如果不传，则默认为当前 Api 的上下文。即上例中 `doSomething` 被调用时，上下文为 `foo`。

`on()` 方法调用后返回一个函数，该函数是一个事件销毁函数，当调用该销毁函数时，本次进行的所有事件绑定都将被解除。

```js
// 绑定事件
let destroy = foo.on("hello world", foo.doSomething);

// 解绑事件
destroy();
```

## once(events, handles, ctx)

参数及用法与 `on` 相同，只是 `once()` 绑定的事件在被响应一次后会自动解绑。

## listenTo(target, events, handles, ctx)

必填参数 `target` 是被监听对象，作为被监听对象，它必须同样具有 ArmorEvents 事件 Api。

当 `target` 对象上触发了指定的 `events`，要么作为回调函数的 handle 被调用，要么事件将转发到 `listener` 上。

`listenTo()` 返回值是一个事件销毁函数。

> 其他参数 `events`, `handles`, `ctx` 与 `on` Api 参数相同。

```js
let destroy = foo.listenTo(bar, "hello", [foo.doSomething, "world"]);

bar.trigger("hello", 200);

// 当事件触发后
// foo.doSomething(200);
// foo.trigger("world", 200);

destroy(); // 解除所有监听
```

## listenToOnce(target, events, handles, ctx)

参见 `listenTo` Api，事件响应一次后自动解除监听。

## off(events, handles, ctx)

- `@param {string|symbol|number|array} [events]`
- `@param {string|symbol|number|array|function} [handles]`
- `@param {object} [ctx]`

可选参数 `events`, `handles`, `ctx` 是用来指定解绑事件的匹配条件， 如果它们为 `undefined` 或 `null`，则表示匹配任意条件。

例如：

```js
// 表示被解除的事件必须同时满足以下条件：
// 1. 事件名称必须是 "hello" 或 "world"；
// 2. 事件响应必须是 foo.doSomething 函数；
// 3. 事件回调上下文必须是 foo。
foo.off("hello world", foo.doSomething, foo);
```

注意：`off()` 解除的事件绑定包含 `listener` 调用 `stopListening()` 的效果。

```js
foo.listenTo(bar, "hello", foo.doSomething);

// bar 在解除自身所有的 hello 事件响应时，一并也解除了 foo 对 bar 的 hello 事件监听。
bar.off("hello");
```

## stopListening(target, events, handles, ctx)

停止监听。

参数 `target` 被监听对象，如果 `target` 为 `undefined` 或 `null`，则针对所有被监听对象进行筛选。

> 其他参数 `events`, `handles`, `ctx` 与 `off` Api 同。

## trigger(events, ...args)

- `@param {string|symbol|number|array} events` 事件名称
- `@param {...any} args` 任意参数

触发事件并提供事件响应参数，所有事件响应是同步逐一调用。

## triggerAsync(events, ...args)

- `@param {string|symbol|number|array} events` 事件名称
- `@param {...any} args` 任意参数

触发事件并提供事件响应参数，所有事件响应是异步（使用 setTimeout）逐一调用。

## channel(events)

> v1.2.0+ 新增

返回一个 `Channel` 对象。当前 ArmorEvents 实例的 `events` 事件被触发时，返回的 `channel` 实例方法的 `feed` 方法被调用，所接参数与 `events` 事件触发参数相同。

> 点击查看 Channel 更多详情
