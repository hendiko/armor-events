# Armor Events

`armor-events` is a library in javascript to manange events, which is inspired by BackboneJS.

# 与 Backbone.Events 差异

## trigger(name, ...args)

在 `armor-events` 中，当函数签名为 `trigger(object, ...args)` 格式时，`args` 被看做事件回调函数的公共参数，你可以在 `object` 中指定事件的定制参数，定制参数会被追加到 `args` 末尾，一并传递给事件回调函数。这个特性是 `Backbone.Events` 的 `trigger` 方法所不支持的。

例如：

```js
import events from "armor-events";
let x = Object.assign({}, events);
x.on("hello", function() {
  console.log(arguments);
});
x.trigger({ hello: "world" }, "welcome"); // 输出 ['welcome', 'world']
```

`armor-events` 执行 `trigger('all')` 时只会触发 `all` 事件一次，而 `Backbone.Events` 会触发两次。

例如：

```js
x.on("all", function() {
  console.log(123);
});

// armor-events 只会打印一次 123
// Backbone.Events 会打印两次 123
x.trigger("all");
```

## listenTo(obj, name, callback, context)

`armor-events` 支持在 `listenTo` 方法中传入 `context`，`Backbone.Events` 不支持。
