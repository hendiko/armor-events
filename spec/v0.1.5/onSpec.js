/*
 * @Author: Xavier Yin
 * @Date: 2018-07-23 17:02:41
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2019-09-24 17:55:42
 */
import ArmorEvents from "../../dist/armor-events_0.1.5";

describe("Test on/once method.", () => {
  let emitter;
  const ID = "emitter";
  beforeEach(() => {
    emitter = Object.assign({ id: ID }, ArmorEvents);
  });

  afterEach(() => {
    emitter.off();
  });

  it("on(name:string, handler:function, context:object)", () => {
    let x = [1, 2, 3];
    let count = 0;
    let context = {};

    let handler = function(y) {
      expect(y).toBe(x); // see if the argument passed by trigger method is correct.
      expect(this).toBe(context); // see if the context set by on method is correct.
      count++;
    };
    emitter.on("hello world", handler, context); // be called with multiple events at the same time.
    emitter.on("no-context", handler); // be called without a context
    emitter.on("hello", handler, context);

    let names = Object.keys(emitter._events);
    expect(names).toEqual(["hello", "world", "no-context"]); // see if event names were correctly bound.

    for (let i in names) {
      let name = names[i];
      let handlers = emitter._events[name];
      expect(handlers.length).toBe(name === "hello" ? 2 : 1); // see if handlers corresponding to event were correctly bound.
      let { ctx, context: _context, callback } = handlers[0];
      expect(ctx).toBe(name === "no-context" ? emitter : context); // see if context of event callback was correctly bound.
      expect(_context).toBe(name === "no-context" ? void 0 : context);
      expect(callback).toBe(handler); // see if callback was correctly bound
    }

    emitter.trigger("hello world", x);
    expect(count).toBe(3); // see if the times of calling callback was correct.
  });

  it("on(name:object, context:object)", () => {
    let count = 0;
    function callback() {
      count++;
    }
    const context = {};
    emitter.on({ "hello world": callback, bye: callback }, context);
    for (let name in emitter._events) {
      expect(
        ["hello", "world", "bye"].findIndex(item => item === name)
      ).toBeGreaterThan(-1);
      let { ctx, context: _context, callback } = emitter._events[name][0];
      expect(ctx).toBe(context);
      expect(_context).toBe(context);
      expect(callback).toBe(callback);
    }

    emitter.trigger("hello world bye");
    expect(count).toBe(3);

    emitter.on({
      calledWithoutContext: function() {
        expect(this.id).toBe(ID); // see if the context of callback is correct when there is no specific context passed into on method.
      }
    });

    emitter.trigger("calledWithoutContext");
  });

  it("once(name:string, handler:function, context:object", () => {
    let context = { count: 0 };
    function callback() {
      this.count++;
    }
    emitter.once("hello world", callback, context);
    emitter.on("hello", callback, context);
    expect(Object.keys(emitter._events)).toEqual(["hello", "world"]);
    emitter.trigger("hello world");
    expect(context.count).toBe(3);
    expect(Object.keys(emitter._events)).toEqual(["hello"]);

    // test calling on without a context
    emitter.once("bye", function(x) {
      expect(this.id).toBe(ID); // see if the context of callback is correct.
      expect(x).toBe("see you"); // see if the argument is correctly passed into callback from trigger method.
    });

    emitter.trigger("bye", "see you");
  });

  it("once(name:object, context:object", () => {
    let context = { count: 0 };
    function callback() {
      this.count++;
    }
    emitter.once({ "hello world": callback }, context);
    emitter.on("hello", callback, context);
    expect(Object.keys(emitter._events)).toEqual(["hello", "world"]);
    emitter.trigger("hello world");
    expect(context.count).toBe(3);
    expect(Object.keys(emitter._events)).toEqual(["hello"]);
    expect(emitter._events["hello"].length).toBe(1);
  });
});
