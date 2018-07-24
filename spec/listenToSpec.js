/*
 * @Author: Xavier Yin 
 * @Date: 2018-07-23 17:02:23 
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2018-07-24 09:40:31
 */
import ArmorEvents from "armor-events";

describe("Test listenTo/listenToOnce method", () => {
  let foo, bar;

  beforeEach(() => {
    foo = Object.assign({ id: "foo", count: 0 }, ArmorEvents);
    bar = Object.assign({ id: "bar" }, ArmorEvents);

    foo.handler = function(msg) {
      this.count++;
      this.msg = `handler ${msg}`;
    };
    foo.on({
      x: function(msg) {
        this.count++;
        this.msg = `x ${msg}`;
      },
      y: function(msg) {
        this.count++;
        this.msg = `y ${msg}`;
      }
    });
  });

  afterEach(() => {
    foo.off();
    foo.stopListening();
    bar.off();
  });

  it("listenTo(target:object, name:string, callback:function)", () => {
    foo.listenTo(bar, "x y", foo.handler);
    bar.trigger("x y", "bar");
    expect(foo.count).toBe(2);
    expect(foo.msg).toBe("handler bar");
  });

  it("listenTo(target:object, name:string, callback:function, context:object)", () => {
    let context = { count: 100 };
    foo.listenTo(bar, "x y", foo.handler, context);
    bar.trigger("x y", "bar");
    expect(foo.count).toBe(0);
    expect(foo.msg).toBe(void 0);
    expect(context.count).toBe(102);
    expect(context.msg).toBe("handler bar");
  });

  it("listenTo(target:object, map:object, context:object)", () => {
    let context = { count: 100 };
    foo.listenTo(bar, { "x y": foo.handler }, context);
    bar.trigger("x y", "bar");
    expect(foo.count).toBe(0);
    expect(foo.msg).toBe(void 0);
    expect(context.count).toBe(102);
    expect(context.msg).toBe("handler bar");
  });

  it("listenToOnce(target:object, name:string, callback:function, context:object)", () => {
    let context = { count: 100 };
    foo.listenToOnce(bar, "x y", foo.handler, context);
    bar.trigger("x y x y", "bar");
    expect(foo.count).toBe(0);
    expect(foo.msg).toBe(void 0);
    expect(context.count).toBe(102);
    expect(context.msg).toBe("handler bar");
  });

  it("listenToOnce(target:object, map:object, context:object)", () => {
    let context = { count: 100 };
    foo.listenToOnce(bar, { "x y": foo.handler }, context);
    bar.trigger("x y x y", "bar");
    expect(foo.count).toBe(0);
    expect(foo.msg).toBe(void 0);
    expect(context.count).toBe(102);
    expect(context.msg).toBe("handler bar");
  });

  it("stopListening()", () => {
    foo.listenTo(bar, "x", foo.handler);
    foo.stopListening();
    bar.trigger("x", "bar");
    expect(foo.count).toBe(0);
  });

  it("stopListening(target:object))", () => {
    let gee = Object.assign({}, ArmorEvents);
    foo.listenTo(gee, "x", foo.handler);
    foo.listenTo(bar, "x", foo.handler);
    foo.stopListening(bar);
    gee.trigger("x", "gee");
    expect(foo.count).toBe(1);
    expect(foo.msg).toBe("handler gee");
  });

  it("stopListening(target:object, name:string)", () => {
    foo.listenTo(bar, "x y z", foo.handler);
    foo.stopListening(bar, "z");
    bar.trigger("x y z", "bar");
    expect(foo.count).toBe(2);
  });

  it("stopListening(target:object, name:string, callback:function)", () => {
    foo.listenTo(bar, "x", foo.handler);
    foo.listenTo(bar, "x", function() {
      this.count = 100;
    });
    foo.stopListening(bar, "x", foo.handler);
    bar.trigger("x", "bar");
    expect(foo.count).toBe(100);
  });

  it("stopListening(target:object, name:string, callback:function, context)", () => {
    let context = { count: 100 };
    foo.listenTo(bar, "x", foo.handler);
    foo.listenTo(
      bar,
      "x",
      function() {
        this.count++;
      },
      context
    );
    foo.stopListening(bar, void 0, void 0, context);
    bar.trigger("x", "bar");
    expect(foo.count).toBe(1);
  });
});
