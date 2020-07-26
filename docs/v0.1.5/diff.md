# ArmorEvents 与 Backbone.Events 差异

## 事件转发

Backbone.Events 不提供事件转发功能，而 ArmorEvents 提供了事件转发的相关 API：`forward`, `forwardOnce`, `stopForwarding`。

## `all` 事件处理

在 Backbone.Events 中，直接触发 `all` 事件，会引发 `all` 事件对应回调队列被调用两次。第一次响应原始事件 `all`，第二次响应特殊事件 `all`。

在 ArmorEvents 中，直接触发 `all` 事件，只会调用 `all` 事件对应回调队列一次。

```js
// 以下代码在 Backbone.Events 中会打印两遍 foo，
// 而在 ArmorEvents 中只会打印一遍 foo。
obj.on("all", function (event) {
  console.log(event);
});
obj.trigger("foo");
```

## `off` 方法

ArmorEvents 支持事件监听与事件转发，而二者的解除都是使用 `off` 方法实现。

Backbone.Events 的 `off` 方法签名：

`obj.off([event:string], [callback:function], [context:object])`

ArmorEvents 的 `off` 方法签名：

- `obj.off([event:string], [callback:function], [options:object])`
- `obj.off([event:string], [destination:string], [options:object])`

即在解除指定上下文的事件监听时，ArmorEvents 传参格式为 `options.context`，而 Backbone.Events 直接传入 `context`。

### `off` 方法的 `event` 参数

Backbone.Events 中将 `event` 参数值为否时视为等效，即空字符串，`undefined`, `null`，`false` 和 `0` 都会导致不限定事件名解绑。

而在 ArmorEvents 中，只有 `event` 值为 `undefined` 或 `null` 时才会不限定事件解绑。

```js
x.on("foo", function () {
  console.log(1);
});

// 在 Backbone.Events 中，以下任意一种情况都会导致所有事件被解绑
x.off();
x.off(null);
x.off(false);
x.off("");
x.off(0);

// 在 ArmorEvents 中
x.off(); // 解绑所有事件
x.off(null); // 解绑所有事件
x.off(false); // 解绑事件名为 false 的事件
x.off(""); // 解绑事件名为 '' 的事件
x.off(0); // 解绑事件名为 0 的事件
```

## `trigger(map:object, ...args)` 传递公参

在 ArmorEvents 中，`trigger(map:object, ...args)` 中的 `...args` 参数将作为公共参数传递给事件回调函数，公共参数位于事件参数之前。

```js
obj.on("hello", function () {
  console.log([...arguments].join(""));
});
obj.trigger({ hello: "Jhon" }, "Welcome!", " my friend "); // 打印 Welcome! my friend Jhon
```

## `listenTo(target:object, event:string, callback:function, [context:object])` 传递上下文

ArmorEvents 中支持在 `listenTo` 和 `listenToOnce` 中传入可选参数 `context` 作为回调函数上下文。

## `stopListening(target:object, event:string, callback:function, [context:object])` 传递上下文

ArmorEvents 中支持在 `stopListening` 中传入可选参数 `context` 作为解除监听条件。
