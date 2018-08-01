# trigger

触发事件并向事件回调函数传递参数。

## trigger(event:string, [...args])

- event(string): 事件名称，多个事件以空格分隔。
- args(any): 事件函数调用参数。

```js
obj.on("hello", function() {
  console.log([...arguments].join(""));
});
obj.trigger("hello", "Welcome,", " my friend!"); // 打印 Welcome! my friend!
```

## trigger(map:object, [...args])

- map(object): 键名为事件名，键值为事件私有参数。
- args(any): 事件函数调用公共参数，公共参数将与私有参数按位置顺序合并传递给回调函数，公共参数位于私有参数前面。

```js
obj.on("hello", function() {
  console.log([...arguments].join(""));
});
obj.trigger({ hello: "Jhon" }, "Welcome!", " my friend "); // 打印 Welcome! my friend Jhon
```
