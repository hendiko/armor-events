/*
 * @Author: Xavier Yin
 * @Date: 2026-06-05 00:00:00
 *
 * Current ArmorEvents behavior tests migrated from the historical beta spec.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ArmorEvents, { Channel } from "../src";
import { keys } from "../src/utils";
import type { ArmorEventsInstance } from "../src/types";

/**
 * 判断事件对象内部状态是否已清空。
 */
function isClean(owner: ArmorEventsInstance): boolean {
  let { events, handlers, listenings } = owner._armorEvents!;
  return (
    keys(events).length + keys(handlers).length + keys(listenings).length === 0
  );
}

/**
 * 获取当前 handler 数量。
 */
function hasHandlers(owner: ArmorEventsInstance): number {
  let { handlers } = owner._armorEvents!;
  return keys(handlers).length;
}

/**
 * 空响应函数，用于只验证绑定/解绑行为。
 */
function handle() {}

describe("ArmorEvents", () => {
  let foo: ArmorEventsInstance;
  let bar: ArmorEventsInstance;

  beforeEach(() => {
    // 每个用例都使用新的事件对象，避免内部 _armorEvents 状态互相影响。
    foo = ArmorEvents();
    bar = ArmorEvents();
  });

  afterEach(() => {
    // 用例结束后主动清理，保证失败用例不会把绑定状态带到后续用例。
    foo.off();
    bar.off();
  });

  it("on supports multiple argument forms and destroy functions", () => {
    const ctx = {};
    let arg = ctx;
    const callback = function (this: unknown, x: unknown, y: unknown) {
      expect(this).toBe(ctx);
      expect(x).toBe(arg);
      expect(y).toBe(arg);
    };

    // 覆盖单事件、多事件、Symbol 事件、事件 map 和 all 事件绑定。
    let d1 = foo.on("foo", callback, ctx);
    let d2 = foo.on("hello world", [callback], ctx);
    let e = Symbol(0);
    let d3 = foo.on(["welcome you", e], callback, ctx);
    let d4 = foo.on({ bee: [callback] }, ctx);
    let d5 = foo.on("all", vi.fn());

    // 一次触发字符串事件组和 Symbol 事件，验证参数与上下文保持旧行为。
    foo.trigger(["foo hello world welcome you bee", e], arg, arg);

    let { events: _events } = foo._armorEvents!;

    // 解绑函数应只清理本次绑定的事件，不影响同对象上其他事件。
    expect(Object.prototype.hasOwnProperty.call(_events, "foo")).toBeTruthy();
    expect(Object.prototype.hasOwnProperty.call(_events, "hello")).toBeTruthy();
    expect(Object.prototype.hasOwnProperty.call(_events, "world")).toBeTruthy();
    d2();
    expect(Object.prototype.hasOwnProperty.call(_events, "hello")).toBeFalsy();
    expect(Object.prototype.hasOwnProperty.call(_events, "world")).toBeFalsy();
    expect(Object.prototype.hasOwnProperty.call(_events, "foo")).toBeTruthy();

    d1();
    d3();
    d4();
    d5();
    expect(keys(_events).length).toBe(0);
  });

  it("listenTo tracks and destroys listener relationships", () => {
    const arg = {};

    let count = 0;
    function callback(this: unknown, value: unknown) {
      count++;
      expect(value).toBe(arg);
      expect(this).toBe(foo);
    }

    // listenTo 支持普通事件名、数组事件名和事件 map 三种形式。
    let d1 = foo.listenTo(bar, "hello", callback);

    let s = Symbol("key");
    let d2 = foo.listenTo(bar, ["foo", s], callback);

    let d3 = foo.listenTo(bar, { bee: callback });

    // 被监听对象触发事件后，响应上下文默认为监听者 foo。
    bar.trigger([s, "foo bee hello"], arg);

    // listener 和 target 两侧都应建立可追踪的监听索引。
    expect(keys(foo._armorEvents!.listenings).length).toBe(1);
    expect(keys(bar._armorEvents!.events).length).toBe(4);

    // 每个 listenTo 返回的 destroy 函数只解除对应那批监听。
    d1();
    d2();
    d3();

    expect(keys(foo._armorEvents!.listenings).length).toBe(0);
    expect(keys(bar._armorEvents!.events).length).toBe(0);

    expect(count).toBe(4);
  });

  it("forwards events through event-name handles", () => {
    let arg = {};
    let count = 0;
    function callback(x: unknown) {
      count++;
      expect(x).toBe(arg);
    }

    // foo 自身把 x 转发为 y，随后 y 的 callback 被调用一次。
    foo.on("x", "y");
    foo.on("y", callback);

    foo.trigger("x", arg);
    expect(count).toBe(1);

    // listenTo 的 handle 也可以是事件名；此时事件会转发到 listener 自身。
    bar.listenTo(foo, "x y z", "z");
    bar.on("z", callback);

    foo.trigger("x", arg);
    expect(count).toBe(4);

    // off 可以用事件名和转发目标事件名筛选并解除转发绑定。
    foo.off("x", "y z");
    expect(Object.prototype.hasOwnProperty.call(foo._armorEvents!.events, "x")).toBeFalsy();

    // x 已解除后不再触发；y 仍保留自身 callback 和 bar 的监听转发。
    foo.trigger("x", arg);
    expect(count).toBe(4);

    foo.trigger("y", arg);
    expect(count).toBe(6);

    // stopListening 只解除指定事件名对应的监听，其他监听索引保留。
    bar.stopListening(foo, "y");
    foo.trigger("y", arg);
    expect(count).toBe(7);
    expect(
      keys(bar._armorEvents!.listenings[foo._armorEvents!.id].events).length
    ).toBe(1);

    bar.stopListening();
    expect(keys(bar._armorEvents!.listenings).length).toBe(0);
  });

  it("destroys grouped bindings", () => {
    // on(eventMap) 返回的 destroy 函数应销毁 map 中创建的全部绑定。
    let d = foo.on({ "hello world": handle, "some others": handle });
    expect(isClean(foo)).toBeFalsy();

    d();
    expect(isClean(foo)).toBeTruthy();

    // listenTo 返回的 destroy 函数应同时清理 target 和 listener 两侧状态。
    let d2 = bar.listenTo(foo, "come on", handle);
    d2();

    expect(isClean(foo)).toBeTruthy();
    expect(isClean(bar)).toBeTruthy();
  });

  it("once and listenToOnce remove handlers after the first response", () => {
    // once 和 listenToOnce 都应在首次响应前先解除自身绑定。
    foo.once("hello world", handle);
    bar.listenToOnce(foo, "hello world", handle);

    foo.trigger("hello world");

    expect(isClean(foo)).toBeTruthy();
    expect(isClean(bar)).toBeTruthy();
  });

  it("off and stopListening filter by event, handle, and context", () => {
    // 复用一组绑定组合，逐个验证 off/stopListening 的筛选条件。
    function isCleared() {
      expect(isClean(foo)).toBeTruthy();
      expect(isClean(bar)).toBeTruthy();
    }

    let lee = Symbol();
    function install() {
      // 两个普通 on 绑定、两个 listenTo 绑定，分别覆盖默认 ctx、显式 ctx 和 Symbol 事件。
      foo.on("hello world", handle);
      foo.on("bee", handle, bar);
      bar.listenTo(foo, "moo", handle);
      bar.listenTo(foo, lee, handle, foo);
    }

    // 不传条件时，off 清理 owner 上所有事件和关联监听索引。
    install();
    foo.off();
    isCleared();

    // handles 条件为函数时，匹配所有使用该函数的 handler。
    install();
    foo.off(null, handle);
    isCleared();

    // ctx 条件应只匹配对应上下文，分两次清理后才完全清空。
    install();
    foo.off(null, null, foo);
    expect(hasHandlers(foo)).toBe(2);
    foo.off(null, null, bar);
    isCleared();

    // event、handle、ctx 三个条件需要同时满足才会被解除。
    install();
    foo.off("hello", handle, foo);
    expect(hasHandlers(foo)).toBe(4);
    foo.off(["world bee moo", lee]);
    isCleared();

    // stopListening 不传 target 时，只清理 listener 发起的监听，不清理 owner 自身 on 绑定。
    install();
    bar.stopListening();
    expect(hasHandlers(foo)).toBe(3);
    foo.off();

    // stopListening(target) 限定被监听对象，但仍匹配该 target 上的所有监听事件。
    install();
    bar.stopListening(foo);
    expect(hasHandlers(foo)).toBe(3);
    foo.off();

    // stopListening(target, events) 只移除指定事件名对应的监听。
    install();
    bar.stopListening(foo, "moo");
    expect(hasHandlers(foo)).toBe(4);
    foo.off();

    // stopListening 的 ctx 条件与 off 一样，用于精确筛选 handler 上下文。
    install();
    bar.stopListening(foo, null, null, foo);
    expect(hasHandlers(foo)).toBe(4);
    foo.off();

    // stopListening 的 handles 条件用于按响应函数或转发事件名筛选。
    install();
    bar.stopListening(foo, null, handle);
    expect(hasHandlers(foo)).toBe(3);
    foo.off();
  });
});

describe("Channel", () => {
  it("feeds data to onData handlers", () => {
    let channel = new Channel();

    const a = 1;
    const b = 2;

    // onData 绑定的回调应收到 feed 传入的全部参数。
    channel.onData((x, y) => {
      expect(x).toBe(a);
      expect(y).toBe(b);
    });

    channel.feed(a, b);
  });

  it("onceData is called once", async () => {
    let channel = new Channel();

    let a = 1;

    // 使用 Promise 等待异步断言窗口，确保第二次 feed 不会再次调用 onceData。
    await new Promise<void>((resolve) => {
      channel.onceData((x) => {
        expect(x).toBe(a);
        a++;
        setTimeout(resolve, 10);
      });

      channel.feed(a);
      channel.feed(a);
    });

    expect(a).toBe(2);
  });

  it("ArmorEvents.channel connects events to a channel", () => {
    let events = new ArmorEvents();

    // channel(eventNames) 会把 ArmorEvents 的事件输出接入新 Channel。
    let channel = events.channel!("hello world");

    let o = {
      a: 1,
    };

    channel.onData((x) => {
      expect(x).toEqual(o);
      o.a++;
    });

    // "hello world" 会被拆成两个事件，因此一次 trigger 会让 channel 收到两次数据。
    events.trigger("hello world", o);

    expect(o.a).toEqual(3);

    // 通过 ArmorEvents.channel 创建的 Channel 会记录事件对象作为 upstream。
    expect(channel.upstream).toBe(events);

    channel.detach();

    expect(channel.upstream).toBeNull();

    // detach 后 upstream 不再向 channel 输送数据。
    events.trigger("hello world", o);

    expect(o.a).toEqual(3);
  });

  it("pipes data to a downstream channel", () => {
    let c1 = new Channel();
    let c2 = new Channel();

    let a = 1;

    // 下游 channel 应接收上游 feed 的数据，并在 unpipe 后停止接收。
    c2.onData((x) => {
      expect(x).toEqual(a);
      a++;
    });

    c1.pipe(c2).feed(a);

    c1.unpipe(c2).feed(a);

    expect(a).toEqual(2);
  });

  it("pipes data through a channel chain", () => {
    let c1 = new Channel();
    let c2 = new Channel();
    let c3 = new Channel();

    let a = 1;

    let fn = () => a++;

    // 链式 pipe 会让 c1.feed 依次触发 c1、c2、c3 的 data 响应。
    [c1, c2, c3].map((c) => c.onData(fn));

    c1.pipe(c2.pipe(c3)).feed(a);

    expect(a).toEqual(4);
  });

  it("removes data handlers with off", () => {
    const c1 = new Channel();

    let a = 1;

    let cb1 = () => (a += 1);
    let cb2 = () => (a += 2);

    // 先绑定两个 data 响应，再用 off(cb) 只移除 cb1。
    c1.onData(cb1);
    const destroy = c1.onData(cb2);

    c1.off(cb1);

    c1.feed();

    expect(a).toEqual(3);

    // onData 返回的 destroy 函数应移除对应的单个绑定。
    destroy();

    c1.feed();
    expect(a).toEqual(3);

    const ctx = {};
    c1.onData(cb1, ctx);

    c1.feed();

    // off(null, ctx) 按上下文移除 data 响应。
    c1.off(null, ctx);

    c1.feed();

    expect(a).toEqual(4);
  });
});
