# Armor Events

`armor-events` is a library in javascript to manange events, which is inspired by BackboneJS.

# Installation

`npm install armor-events`

# Usage

```js
import ArmorEvents from "armor-events";
let foo = Object.assign({}, ArmorEvents);
let bar = Object.assign({}, ArmorEvents);

let callback = function(name) {
  console.log(name);
};

foo.on("hello world", callback);
foo.trigger("hello", "say hi"); // print 'say hi'

foo.listenTo(bar, "hello", callback);
bar.trigger("hello", "this is bar"); // print 'this is bar'

foo.forward(bar, "world", "hello");
bar.trigger("world", "this is bar"); // print 'this is bar'

foo.stopListening();
foo.stopForwarding();
foo.off();
```

# API

## [on](./api/zh/on.md)

Bind events onto object.

- `on(event:string, callback:function, [context:object]`
- `on(map:object, [context:object])`

## [off](./api/zh/off.md)

Unbind events from object.

- `off([event:string], [callback:function], [options:object])`
- `off([event:string], [destination:string], [opitons:object])`

## [trigger](./api/zh/trigger.md)

- `trigger(event:string, [...args])`
- `trigger(map:object, [...args])`

## [once](./api/zh/once.md)

Bind once events onto object.

- `once(event:string, callback:function, [context:object]`
- `once(map:object, [context:object])`

## [listenTo](./api/zh/listenTo.md)

Listen to other object.

- `listenTo(target:object, event:string, callback:function, [context:object])`
- `listenTo(target:object, map:object, [context:object])`

## [stopListening](./api/zh/stopListening.md)

Stop listening to other object.

- `stopListening([target:object], [event:string], [callback:function], [context:object])`
- `stopListening([target:object], map:object, [context:object])`

## [listenToOnce](./api/zh/listenToOnce.md)

Listen once to other object.

- `listenToOnce(target:object, event:string, callback:function, [context:object])`
- `listenToOnce(target:object, map:object, [context:object])`

## [forward](./api/zh/forward.md)

Forward events from other object.

- `forward(target:object, [origin:string], [dest:string])`
- `forward(target:object, map:object)`

## [forwardOnce](./api/zh/forwardOnce.md)

Forward once events from other object.

- `forwardOnce(target:object, [origin:string], [dest:string])`
- `forwardOnce(target:object, map:object)`

## [stopForwarding](./api/zh/stopForwarding.md)

Stop forwarding events from other object.

- `stopForwarding([target:object], [origin:string], [dest:string])`
- `stopForwarding([target:object], map:object)`

# Compare with Backbone.Events

[ArmorEvents vs Backbone.Events](./diff.md)
