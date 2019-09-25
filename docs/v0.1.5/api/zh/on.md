# on

拥有 `on` 方法的宿主对象可以使用该方法绑定事件及其回调函数，一个事件可以绑定多个回调函数，当事件被触发时，事件对应的回调函数被逐个调用。

你可以向 `on` 方法传递 `context` 参数作为回调函数的上下文，回调函数的缺省上下文为宿主对象本身。

## on(event:string, callback:function, [context:object])

- event(string): 事件名称。若同时绑定多个事件，事件名之间以空格分隔。
- callback(function): 事件回调函数。
- context(object): （可选）事件回调函数调用时的上下文。如果未传递该参数，则默认以 `on` 方法的宿主对象作为回调函数的上下文。

> 注：若 callback 是箭头函数，则无法绑定 context。

```js
obj.on("hello", callback);
obj.on("hello world", callback);
obj.on("hello world", callback, anotherObjectAsContext);
```

## on(map:object, [context:object])

`on` 方法支持以对象类型作为第一个参数，同时绑定多个事件。

```js
obj.on({ hello: callback1, world: callback2 });
obj.on({ hello: callback1, world: callback2 }, anotherObjectAsContext);
```

## `all` 事件

触发任意事件之后都会触发特殊的 `all` 事件，`all` 事件回调函数的第一个参数是被触发的原始事件名，之后参数与原始事件回调函数接收的参数相同。

```js
obj.on("all", function(event, arg1, arg2) {
  console.log(event, arg1, arg2);
});
obj.trigger("foo", 1, 2); // 打印 foo, 1, 2
```
