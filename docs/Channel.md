# Channel

> v1.2.0+ 新增

`Channel` 对象是一个单一事件渠道，它最主要的两个方法为 `feed` 和 `onData`。

`channel.feed(...args)` 方法表示接收数据，当 channel 对象接收到数据后，则自动调用通过 `channel.onData(cb, ctx)` 方法绑定的回调函数。

## 使用方法

通过全局加载 `armor-events` 文件，使用全局变量 `ArmorEvents` 访问 `Channel`。

```js
const channel = new ArmorEvents.Channel();
```

通过 CommonJS 加载。

```js
const { Channel } = require("armor-events");

const channel = new Channel();
```

通过 ES6 加载。

```js
import { Channel } from "armor-events";

const channel = new Channel();
```

通过 ArmorEvents 对象获取。

```js
import ArmorEvents from "armor-events";

const armorEvents = new ArmorEvents();

// 只有 ArmorEvents 实例才拥有 `channel(events)` 方法。
const channel = armorEvents.channel("some_event_names");
```

## API

### canPipe(subchannel:Channel):Boolean

返回 `true` 或 `false` 表示是否可以使用 `channel.pipe(subchannel)` 方法来与目标 channel 对象建立数据管道。

每个 Channel 对象最多只能有一个 upstream 管道，`channel.upstream` 属性指向它的上游 channel 或 armorEvents 对象。

Channel 可以拥有不限数量的 downstream 管道，但所有 channel 管道之间不能存在循环传递数据，该方法会自动检查 subchannel 以及 subchannel 的 subchannel 与当前 channel 之间的关系，如果会造成循环传递数据，则本方法返回 false。

### clean():Channel

解除所有 onData 绑定的回调函数，解除所有与其他 channel 对象之间的管道，包括 upstream 和 downstream 管道。

该方法等价于 `channel.detach().unpipe().off()`。

> upstream 管道是指其他 channel 或 armorEvents 对象传递数据至本 channel 对象的管道。
> downstream 管道是指本 channel 传递数据给其他 channel 对象的管道。

### detach():Channel

解除 upstream 管道，不再自动接收来自上游 Channel 或 ArmorEvents 对象的数据。

### feed(...args):Channel

手动接收数据，同步依次触发 onData 绑定的回调函数，然后再同步依次传递数据至下游 Channel 对象。

### feedAsync(...args):Channel

手动接收数据，但异步触发 onData 绑定的回调函数或者传递数据至下游 Channel 对象。

### onData(cb:function, ctx?:any):function

绑定回调函数 `cb`，当 channel 对象收到数据时触发该回调函数。如果给出可选参数 `ctx` ，它将作为回调函数被调用时的上下文。

返回一个 destroy 函数，调用该 destory 函数表示解除本次 onData 绑定。

### onceData(cb:function, ctx?:any):function

`onData` 的一次性操作，当回调函数 `cb` 被调用一次时，自动解除本次绑定。

### off(cb?:function, ctx?:any):Channel

解除所有 `data` 事件回调（即通过 onData 方法绑定的回调函数）。

如果给出了 cb 或 ctx，则它们所匹配的 onData 绑定将被解除，如果 cb 或 ctx 为 null 或 undefined，则表示可以匹配任意的 cb 和 ctx。

### pipe(subchannel:Channel, transform?:function):Channel

与目标 subchannel 建立数据管道，数据将从本 Channel 对象传递到目标 Subchannel。如果给定可选参数 transform 函数，该函数将接收当前 channel 接收到的数据作为参数值，而该函数的返回值将作为目标 channel 的接收数据。

### unpipe(...subchannels:array<Channel>):Channel

断开本 Channel 对象与指定下游 Channel 之间的数据管道。如果未指定任何 subchannel，则表示断开当前 channel 的所有 downstream 管道。
