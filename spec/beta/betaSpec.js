import ArmorEvents from "../../build/armor-events";
import { keys } from "../../src/utils";

function isClean(owner) {
  let { events, handlers, listenings } = owner._armorEvents;
  return (
    keys(events).length + keys(handlers).length + keys(listenings).length === 0
  );
}

function hasHandlers(owner) {
  let { handlers } = owner._armorEvents;
  return keys(handlers).length;
}

function handle() {}

describe("单元测试：on 方法", () => {
  let foo, bar;

  beforeEach(() => {
    foo = ArmorEvents();
    bar = ArmorEvents();
  });

  afterEach(() => {
    foo.off();
    bar.off();
  });

  it("测试 on 方法：支持多种形式传参以及destroy函数", () => {
    const ctx = {};
    let arg = ctx;
    const handle = function(x, y) {
      expect(this).toBe(ctx); // 上下文是否正确
      expect(x).toBe(arg); //   事件参数是否正确
      expect(y).toBe(arg); // 事件参数是否正确
    };

    // 单事件，单响应
    let d1 = foo.on("foo", handle, ctx);

    // 多事件，多响应
    let d2 = foo.on("hello world", [handle], ctx);

    // 多类型事件(支持symbol类型作为事件名)
    let e = Symbol(0);
    let d3 = foo.on(["welcome you", e], handle, ctx);

    let d4 = foo.on({ bee: [handle] }, ctx);

    let d5 = foo.on("all", (event, arg) => console.log(event, arg));

    foo.trigger(["foo hello world welcome you bee", e], arg, arg);

    let { events: _events } = foo._armorEvents;

    expect(_events.hasOwnProperty("foo")).toBeTruthy();
    expect(_events.hasOwnProperty("hello")).toBeTruthy();
    expect(_events.hasOwnProperty("world")).toBeTruthy();
    d2();
    expect(_events.hasOwnProperty("hello")).toBeFalsy();
    expect(_events.hasOwnProperty("world")).toBeFalsy();
    expect(_events.hasOwnProperty("foo")).toBeTruthy();

    d1();
    d3();
    d4();
    d5();
    expect(keys(_events).length).toBe(0);
  });

  it("测试 listenTo 方法", () => {
    const arg = {};

    let count = 0;
    function handle(arg) {
      count++;
      expect(arg).toBe(arg);
      expect(this).toBe(foo);
    }

    let d1 = foo.listenTo(bar, "hello", handle);

    let s = Symbol("key");
    let d2 = foo.listenTo(bar, ["foo", s], handle);

    let d3 = foo.listenTo(bar, { bee: handle });

    bar.trigger([s, "foo bee hello"], arg);

    expect(keys(foo._armorEvents.listenings).length).toBe(1);
    expect(keys(bar._armorEvents.events).length).toBe(4);

    d1();
    d2();
    d3();

    expect(keys(foo._armorEvents.listenings).length).toBe(0);
    expect(keys(bar._armorEvents.events).length).toBe(0);

    expect(count).toBe(4);
  });

  it("测试事件转发", () => {
    let arg = {};
    let count = 0;
    function handle(x) {
      count++;
      expect(x).toBe(arg);
    }

    foo.on("x", "y");
    foo.on("y", handle);

    foo.trigger("x", arg);
    expect(count).toBe(1);

    bar.listenTo(foo, "x y z", "z");
    bar.on("z", handle);

    foo.trigger("x", arg);
    expect(count).toBe(4);

    foo.off("x", "y z");
    expect(foo._armorEvents.events.hasOwnProperty("x")).toBeFalsy();

    foo.trigger("x", arg);
    expect(count).toBe(4);

    foo.trigger("y", arg);
    expect(count).toBe(6);

    bar.stopListening(foo, "y");
    foo.trigger("y", arg);
    expect(count).toBe(7);
    expect(
      keys(bar._armorEvents.listenings[foo._armorEvents.id].events).length
    ).toBe(1);

    bar.stopListening();
    expect(keys(bar._armorEvents.listenings).length).toBe(0);
  });

  it("测试 destroy", () => {
    function handle() {}
    let d = foo.on({ "hello world": handle, "some others": handle });
    expect(isClean(foo)).toBeFalsy();

    d();
    expect(isClean(foo)).toBeTruthy();

    let d2 = bar.listenTo(foo, "come on", handle);
    d2();

    expect(isClean(foo)).toBeTruthy();
    expect(isClean(bar)).toBeTruthy();
  });

  it("测试 once", () => {
    foo.once("hello world", handle);
    bar.listenToOnce(foo, "hello world", handle);

    foo.trigger("hello world");

    expect(isClean(foo)).toBeTruthy();
    expect(isClean(bar)).toBeTruthy();
  });

  it("测试 off", () => {
    function isCleared() {
      expect(isClean(foo)).toBeTruthy();
      expect(isClean(bar)).toBeTruthy();
    }

    let lee = Symbol();
    function install() {
      foo.on("hello world", handle);
      foo.on("bee", handle, bar);
      bar.listenTo(foo, "moo", handle);
      bar.listenTo(foo, lee, handle, foo);
    }

    install();
    foo.off();
    isCleared();

    install();
    foo.off(null, handle);
    isCleared();

    install();
    foo.off(null, null, foo);
    expect(hasHandlers(foo)).toBe(2);
    foo.off(null, null, bar);
    isCleared();

    install();
    foo.off("hello", handle, foo);
    expect(hasHandlers(foo)).toBe(4);
    foo.off(["world bee moo", lee]);
    isCleared();

    install();
    bar.stopListening();
    expect(hasHandlers(foo)).toBe(3);
    foo.off();

    install();
    bar.stopListening(foo);
    expect(hasHandlers(foo)).toBe(3);
    foo.off();

    install();
    bar.stopListening(foo, "moo");
    expect(hasHandlers(foo)).toBe(4);
    foo.off();

    install();
    bar.stopListening(foo, null, null, foo);
    expect(hasHandlers(foo)).toBe(4);
    foo.off();

    install();
    bar.stopListening(foo, null, handle);
    expect(hasHandlers(foo)).toBe(3);
    foo.off();
  });
});
