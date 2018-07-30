# stopListening

停止监听行为。

## stopListening([target:object], [event:string], [callback:function], [context:object])

- target(object): (可选)停止监听的对象，如果该参数为否定值，则停止监听所有已监听的对象。
- event(string): (可选)停止监听的事件名，如果该参数值为 `null` 或 `undefined`，则不限定事件名作为解除监听条件。
- callback(function): (可选)如果该参数值为 `undefined`，则表示不限定回调函数作为解除监听条件，否则以是否匹配到该参数值作为解除监听条件之一。
- context(object): 如果给出该选项，则 `context` 作为解除监听条件之一。

```js
obj.stopListening(); // 解除所有已监听行为。
obj.stopListening(other); // 解除所有对 other 的监听行为。
obj.stopListening(null, "hello"); // 解除所有对事件 hello 的监听行为。
obj.stopListening(null, null, callback); // 解除所有回调函数是 callback 的监听行为。
obj.stopListening(null, null, void 0, ctx); // 解除所有回调函数上下文是 ctx 的监听行为。
```

## stopListening([target:object], map:object, [context:object])

- target(object): 同上。
- map(object): 键名为事件名，键值为事件回调函数。
- context: 同上。
