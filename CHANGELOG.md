# v1.0.0

1. 重写事件能力，重构了内部实现。
2. 移除 `forward`, `forwardOnce`, `stopForwarding` 三个 API，事件转发通过 `on` 或 `listenTo` 实现。
3. 增加 `triggerAsync` 方法，支持异步调用回调函数。
4. `armor-events` 模块导出的 `ArmorEvents` 由 Plain Object 变成一个函数。
5. `on/once`, `listenTo/listenToOnce` 返回值为事件销毁函数。
6. 单个事件名称增加支持 Symbol 类型。
7. 事件 API 变化：
   7.1. `on/once/listenTo/listenToOnce` 方法参数兼容上个版本，同时增加了事件转发。
   7.2. `off()` 第三个参数只能是 `ctx` 或 `undefined` 和 `null`。不再支持 `options` 作为第三个参数。
   7.3. 不再支持 `trigger(map:object, ..args)` 传参。
   7.4. 不再支持 `stopListening([target:object], map:object, [context:object])` 传参。

# v0.1.5

1.  修复以空格分隔多事件参数，没有去除首尾空白字符。

# v0.1.4

1.  修复 off(name) 中参数 name 为空字符串时会导致无限定事件名解绑的发生（name 应该只有等于 undefined 或 null 时才无限定事件名解绑）。
2.  修复 off(null, void 0, {action: 'forward'}) 会导致所有事件被解除的 BUG，应该只解除所有事件转发。

# v0.1.3

1.  增加 off 测试用例，以及增补 forward 测试用例。
2.  修复 stopForward 方法未能正确解除监听。（修复 v0.1.2 第 5 条修复带来的错误。）

# v0.1.2

1.  新增测试用例。
2.  修复 off 方法。修复当调用 once 和 on 绑定同一个事件和 callback 时，trigger 事件后，两次绑定同时被解除的问题。
3.  修复 forward 方法。forwardApi 作为 iterateApi 的 iteratee，没有返回它的第一个参数，导致 iterateApi 递归结果不正确，导致 forward 方法同时处理多个事件时发生错误。
4.  修复 forward 方法，未正确转发 trigger 传入的参数。
5.  修复 forward(target, origin) 与 stopForward(target, origin) 未能正确解除监听。因为此时 dest 参数为 void 0，forward 自动将 void 0 转译为 null，而 stopFoward 未将 dest 的 void 0 转译为 null，导致匹配不正确。

# v0.1.1

更新发布到 npm 的内容。

# v0.1.0

首次发布。
