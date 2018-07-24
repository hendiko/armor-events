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
