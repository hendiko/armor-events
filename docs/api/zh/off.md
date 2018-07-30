# off

拥有 `off` 方法的宿主对象使用该方法解除事件监听或事件转发。

## off([event:string], [callback:function], [options:object])

- event(string): 事件名称。多个事件以空格分隔。如果该参数为 `null` 或 `undefined` 则表示不限定事件名进行解绑，否则该事件名将作为解绑条件之一。
- callback(function): 回调函数。如果该参数为 `undefined`，则表示不限定回调函数进行解绑，否则该回调函数将作为解绑条件之一。
- options(object): 该可选参数的字段如下：
  - context(object): 如果给出该选项，则 `context` 将作为解绑条件之一去匹配回调函数的上下文。
  - action(string): 该选项值可能为 `listen` 或 `forward` 分别表示只解绑事件监听、或只解绑事件转发。如果未给出该选项，则表示同时解除事件监听与转发。

```js
obj.off(); // 解除所有事件监听与转发。
obj.off("foo"); // 解除事件 foo 对应的所有事件监听与转发。
obj.off("foo", callback); // 解除事件 foo 下所有回调函数为 callback 的事件监听。
obj.off(null, callback); // 解除所有事件中，回调函数为 callback 的事件监听。
obj.off(null, void 0, { context: ctx }); // 解除所有事件中，回调函数上下文为 ctx 的事件监听
```

## off([event:string], [destination:string], [options:object])

- event(string): 同上。
- destination(string): 事件转发到目标事件。如果该参数为 `undefined` 表示不限定目标事件进行解绑；否则该参数将作为解绑条件之一去匹配所有事件转发的目标事件。
- options(object): 该可选参数的字段如下：
  - action(string): 该选项值可能为 `listen` 或 `forward` 分别表示只解绑事件监听、或只解绑事件转发。如果未给出该选项，则表示同时解除事件监听与转发。

```js
obj.off("foo"); //  解除所有转发 `foo` 的事件转发。
obj.off("foo", "bar"); // 解除所有符合从事件 `foo` 转发到 `bar` 事件的事件转发
obj.off(null, "bar"); // 解除所有转发到 `bar` 的事件转发
```

## 关于 `options` 参数

在一般使用场景中，不推荐使用 `options.action` 参数，除非你的确需要明确地只解绑事件监听或只解绑事件转发。

在解除事件转发时，也需要注意，如果同时传入 `options.context` 与 `options.action='forward'`，它们将导致冲突，因为所有事件转发是不带上下文的，因此将无法匹配到 `options.context`，会导致没有事件转发被解除。所以 `options.context` 选项应只应用于解绑事件监听的场景。
