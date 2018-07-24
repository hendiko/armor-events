/*
 * @Author: Xavier Yin 
 * @Date: 2018-07-24 10:46:38 
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2018-07-24 10:57:01
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
});
