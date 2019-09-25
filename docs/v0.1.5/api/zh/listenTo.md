# listenTo

监听者监听目标对象的事件并作出响应。

## listenTo(target:object, event:string, callback:function, [context:object])

- target(object): 被监听对象。
- event(string): 监听的事件名称，多个事件以空格分隔。
- callback(function)：监听事件的回调函数。
- context(object): （可选）事件回调函数的上下文，缺省以监听者作为回调函数的上下文。

```js
obj.listenTo(other, "hello", callback);
```

## listenTo(target:object, map:object, [context:object])

- target(object): 同上。
- map(object): 键名为事件名称，键值为回调函数。
- context(object): 同上。

```js
obj.listenTo(other, { hello: callback1, world: callback2 });
```
