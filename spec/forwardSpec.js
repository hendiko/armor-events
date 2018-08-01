/*
 * @Author: Xavier Yin 
 * @Date: 2018-07-23 17:02:32 
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2018-07-31 12:11:18
 */
import ArmorEvents from "armor-events";

describe("Test forward/forwardOnce method", () => {
  let foo, bar;

  beforeEach(() => {
    foo = Object.assign({ id: "foo", count: 0 }, ArmorEvents);
    bar = Object.assign({ id: "bar" }, ArmorEvents);

    foo.on({
      hello: function(x) {
        this.count++;
        this.hello = x;
      },
      world: function(x) {
        this.count++;
        this.world = x;
      }
    });
  });

  afterEach(() => {
    foo.off();
    foo.stopForwarding();
    bar.off();
  });

  it("forward()", () => {
    foo.forward();
    expect(foo._listenTo).toBe(void 0);
  });

  it("forward(target:object)", () => {
    foo.forward(bar);
    bar.trigger("hello world", "bye");
    expect(foo.hello).toBe("bye");
    expect(foo.world).toBe("bye");
    expect(foo.count).toBe(2);
  });

  it("forward(target:object, origin:string)", () => {
    foo.forward(bar, "hello");
    bar.trigger("hello", "a1");
    expect(foo.hello).toBe("a1");
    expect(foo.count).toBe(1);
  });

  it("forward(target:object, origin:string, dest:string)", () => {
    foo.forward(bar, "hello", "world");
    bar.trigger("hello", "a2");
    expect(foo.world).toBe("a2");
    expect(foo.count).toBe(1);
    bar.trigger("world", "a3");
    expect(foo.count).toBe(1);
  });

  it("forward(target:object, map:object)", () => {
    foo.forward(bar, { "a b": "world" });
    bar.trigger("a b", "a b");
    expect(foo.world).toBe("a b");
    expect(foo.count).toBe(2);
  });

  it("forward(target:object, 'all')", () => {
    foo.forward(bar, "all");
    bar.trigger("hello", "ab");
    expect(foo.hello).toBe("ab");
    expect(foo.count).toBe(1);
  });

  it("forward(target:object, null, dest:string", () => {
    foo.forward(bar, null, "hello");
    bar.trigger("hello world", "ab");
    expect(foo.hello).toBe("ab");
    expect(foo.count).toBe(2);
  });

  it("forwardOnce(target:object)", () => {
    foo.forwardOnce(bar);
    bar.trigger("hello world", "bye");
    expect(foo.hello).toBe("bye");
    expect(foo.world).toBe(void 0);
    expect(foo.count).toBe(1);
  });

  it("forwardOnce(target:object, map:object)", () => {
    foo.forwardOnce(bar, { "hello world": "hello", how: "world" });
    bar.trigger("hello world how", "three");
    expect(foo.hello).toBe("three");
    expect(foo.world).toBe("three");
    expect(foo.count).toBe(3);
  });

  it('forward(target:object, origin:string, "all")', () => {
    let a = [];
    foo.on("all", function(name, arg) {
      a.push(`${name} ${arg}`);
    });
    foo.forward(bar, "hello world", "all");
    bar.trigger("hello world", "come on");
    expect(foo.hello).toBe(void 0);
    expect(foo.world).toBe(void 0);
    expect(a).toEqual(["hello come on", "world come on"]);
  });

  it('forwardOnce(target:object, origin:string, "all")', () => {
    let a = [];
    foo.on("all", function(name, arg) {
      a.push(`${name} ${arg}`);
    });
    foo.forwardOnce(bar, "hello world", "all");
    bar.trigger("hello world hello world", "come on");
    expect(foo.hello).toBe(void 0);
    expect(foo.world).toBe(void 0);
    expect(a).toEqual(["hello come on", "world come on"]);
  });

  it("stopForwarding()", () => {
    foo.forward(bar);
    expect(foo._listeningTo[bar._listenId]).toBe(bar._listeners[foo._listenId]);
    foo.stopForwarding();
    expect(foo._listenTo).toBe(void 0);
    expect(bar._listeners).toEqual({});
  });

  it("stopForwarding(target:object, origin:string)", () => {
    foo.forward(bar, "hello world");
    bar.trigger("hello world", "come on");
    expect(foo.hello).toBe("come on");
    expect(foo.world).toBe("come on");
    expect(foo.count).toBe(2);
    foo.stopForwarding(bar, "hello");
    bar.trigger("hello world", "come on 2");
    expect(foo.hello).toBe("come on");
    expect(foo.world).toBe("come on 2");
    expect(foo.count).toBe(3);
  });

  it("stopForwarding(target:object, origin:string, dest:string)", () => {
    foo.forward(bar, "hello world", "hello bye");
    bar.trigger("hello world", "come on");
    expect(foo.hello).toBe("come on");
    expect(foo.world).toBe(void 0);
    expect(foo.count).toBe(2);
    foo.stopForwarding(bar, "hello", "hello bye");
    bar.trigger("hello world", "come on 2");
    expect(foo.hello).toBe("come on 2");
    expect(foo.count).toBe(3);
  });

  it("stopForwarding(target:object, map:object)", () => {
    foo.forward(bar, { "hello world": "hello bye" });
    bar.trigger("hello world", "come on");
    expect(foo.hello).toBe("come on");
    expect(foo.world).toBe(void 0);
    expect(foo.count).toBe(2);
    foo.stopForwarding(bar, { hello: "hello bye" });
    bar.trigger("hello world", "come on 2");
    expect(foo.hello).toBe("come on 2");
    expect(foo.count).toBe(3);
  });

  it('stopForwarding("")', () => {
    foo.forward(bar, "", "hello");
    foo.forward(bar, "hello");
    bar.trigger("", 1);
    expect(foo.count).toBe(1);
    foo.stopForwarding(bar, "");
    bar.trigger("hello", 2);
    expect(foo.count).toBe(2);
  });
});

describe("Test forward/forwardOnce method", () => {
  let foo, bar;

  let callback = function(msg) {
    this.count++;
    this.msg = `${this.id || ""}:${this.count}:${msg}`;
  };

  beforeEach(() => {
    foo = Object.assign({ id: "foo", count: 0 }, ArmorEvents);
    bar = Object.assign({ id: "bar" }, ArmorEvents);
  });

  afterEach(() => {
    foo.off();
    foo.stopForwarding();
    bar.off();
  });

  it("foo.stopForwarding(bar, name)", () => {
    foo.forward(bar, "x", "y");
    foo.on("y", callback);
    bar.trigger("x", 1);
    expect(foo.msg).toBe("foo:1:1");
    foo.stopForwarding(bar, "x");
    bar.trigger("x", 2);
    expect(foo.msg).toBe("foo:1:1");

    foo.forward(foo, "x", "y");
    foo.trigger("x", 3);
    expect(foo.msg).toBe("foo:2:3");
    foo.stopForwarding(foo);
    foo.trigger("x", 4);
    expect(foo.msg).toBe("foo:2:3");
  });
});
