import { forward, forwardOnce, stopForwarding } from "./forward";
import { off, stopListening } from "./off";
import { on, once, listenTo, listenToOnce } from "./on";
import trigger from "./trigger";

module.exports = {
  forward,
  forwardOnce,
  listenTo,
  listenToOnce,
  off,
  on,
  once,
  stopForwarding,
  stopListening,
  trigger
};
