# stopForwarding

停止事件转发。

## stopForwarding([target:object], [origin:string], [dest:string])

- target(object): 被监听的对象，如果该参数为否定值，则不限定被监听对象作为解除条件之一，否则将被监听对象匹配到该参数作为解除条件之一。
- event(string): 监听的事件。如果该参数值为 `null` 或 `undefined`，则不限定事件名作为解除条件之一。否则将监听事件名匹配到该参数作为解除条件之一。
- dest(string): 转发事件。如果该参数值为 `undefined`，则表示不限定转发事件作为解除条件之一。否则将转发事件名匹配到该参数作为解除条件之一。

```js
obj.stopForwarding(); // 停止所有事件转发。
obj.stopForwarding(other); // 停止转发 other 的所有事件。
obj.stopForwarding(other, "hello"); // 停止转发 other 的 hello 事件。
obj.stopForwarding(other, "hello", "world"); // 停止转发 other 的 hello 事件到 world 事件。
obj.stopForwarding(null, "hello"); // 停止所有从 hello 事件的转发。
obj.stopForwarding(null, "hello", "world"); // 停止所有从 hello 到 world 的事件转发。
```

#### `dest` 值为 `null` 不等同于 `dest` 值为 `undefined`。

```js
// 1. obj 原样转发 other 的 hello 事件。
obj.forward(other, "hello", null);
// 2. obj 转发 other 的 hello 事件到自己的 world 事件。
obj.forward(other, "hello", "world");

// dest=null 只停止监听转发事件为 null 的事件。
obj.stopForwarding(other, "hello", null); // 只是停止 1 的事件转发。

// dest=undefined 会匹配所有转发事件名。
obj.stopForwarding(other, "hello", void 0); // 停止 1 和 2
```

#### `origin` 与 `dest` 多事件格式

`origin` 中多事件以空格分隔，等同于分开多次设定相关事件。

```js
obj.stopForwarding(other, "hello world");

// 等同于
obj.stopForwarding(other, "hello");
obj.stopForwarding(other, "world");
```

但 `dest` 中以空格分隔的多事件，不等同于多次设定相关事件。只有 `dest` 参数完全匹配 `forward` 方法中的 `dest` 参数时，才能正确停止相关事件转发。

```js
obj.forward(other, "foo", "hello world");

// 不会停止以上事件转发
obj.stopForwarding(other, "foo", "hello");
obj.stopForwarding(other, "foo", "world");

// 或者以下格式也不会停止事件转发
obj.stopForwarding(other, "foo", "  hello world");
obj.stopForwarding(other, "foo", "hello    world");

// 只有二者的 dest 参数完全匹配时，才会停止事件转发
obj.stopForwarding(other, "foo", "hello world");
```

## stopForwarding([target:object], map:object)

`map` 的 key 为 `origin`, `value` 为 `dest`。
