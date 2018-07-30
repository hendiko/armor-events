/*
 * @Author: Xavier Yin 
 * @Date: 2018-07-24 10:46:38 
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2018-07-28 09:23:28
 */

import ArmorEvents from "armor-events";
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

  it("off()", () => {
    foo.on("x y", callback);
    foo.forward(bar, "x y");
    bar.off("x");
    bar.trigger("x y", "bar");
    expect(foo.msg).toBe("foo:1:bar");
    bar.off();
    bar.trigger("x y", "bar");
    expect(foo.msg).toBe("foo:1:bar");
    foo.trigger("x", "foo");
    expect(foo.msg).toBe("foo:2:foo");
    foo.off(void 0, callback);
    foo.trigger("x", "foo");
    expect(foo.msg).toBe("foo:2:foo");
  });

  // it's totally different between null and undefined which is pass to off.
  it("off(null, null)", () => {
    foo.on("x", callback);
    foo.off(null, null); // this won't unbind any event.
    foo.trigger("x", "1");
    expect(foo.count).toBe(1);
    foo.off(void 0, void 0); // unbind all events
    foo.trigger("x", 1);
    expect(foo.count).toBe(1);
  });
});
