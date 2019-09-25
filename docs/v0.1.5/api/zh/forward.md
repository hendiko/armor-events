# forward

转发事件。

## forward(target:object, [origin:string], [dest:string])

监听 `target` 的 `origin` 事件，将 `origin` 事件转发为自己的 `dest` 事件。

- target(object): 被监听对象。
- origin(string): 被监听的事件。如果该参数值为 `undefined` 或 `null`，表示监听 `target` 所有事件，否则将监听给定的事件，多个事件以空格分隔。
- dest(string): 转发的事件名。如果该参数值为 `undefined` 或 `null`，则表示同名转发所监听到的事件，否则将按照给定的事件名称进行转发，多个事件以空格分隔。

```js
obj.forward(other); // 转发 other 所有事件。
obj.forward(other, "hello world"); // 转发 other 的 hello 和 world 事件。
obj.forward(other, "hello", "world"); // 将 other 的 hello 事件转发到 obj 的 world 事件。
```

#### 事件转发的传参

当 `origin` 为 `null` 或 `undefined` 时，它等同于 `all`。

```js
// 以下两种转发事件是等效的。
obj.forward(other, null);
obj.forward(other, "all");
```

如果事件被转发到 `all` 事件，那么转发事件的传参将符合 `all` 的传参要求，即第一个参数为原始事件名，其后跟着的是事件其他参数。

```js
obj.forward(other, "hello", "all");
obj.on("all", function() {
  console.log(arguments);
});
other.trigger("hello", "ArmorEvents");
// 打印出 ["hello", "ArmorEvents"]
```

如果事件未转发到 `all` 事件，那么转发事件的参数与原事件参数一致。

```js
obj.forward(other, "hello");
obj.on("hello", function() {
  console.log(arguments);
});
other.trigger("hello", "ArmorEvents", "Awesome");
// 打印出 ["ArmorEvents", "Awesome"]
```

## forward(target:object, map:object)

支持 `map` 格式传入参数，`map` 的 key 为 `origin` 事件名，`value` 为 `dest` 转发事件。
