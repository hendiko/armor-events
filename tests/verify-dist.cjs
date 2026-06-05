/*
 * @Author: Xavier Yin
 * @Date: 2026-06-05 00:00:00
 *
 * Verifies generated package artifacts can be consumed through CJS, ESM and UMD.
 */
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

(async () => {
  const root = path.join(__dirname, "..");

  // CJS bundle must preserve the historical require() shape:
  // the exported value is the ArmorEvents function and Channel is attached to it.
  const cjs = require(path.join(root, "dist/armor-events.cjs"));
  assert.equal(typeof cjs, "function");
  assert.equal(typeof cjs.Channel, "function");
  const cjsEvents = cjs();
  let cjsValue = 0;
  cjsEvents.on("hello", () => cjsValue++);
  cjsEvents.trigger("hello");
  assert.equal(cjsValue, 1);

  // ESM bundle must expose both default ArmorEvents and named Channel.
  const esm = await import(path.join(root, "dist/armor-events.mjs"));
  assert.equal(typeof esm.default, "function");
  assert.equal(typeof esm.Channel, "function");
  const esmEvents = esm.default();
  let esmValue = 0;
  esmEvents.on("hello", () => esmValue++);
  esmEvents.trigger("hello");
  assert.equal(esmValue, 1);

  // UMD bundle must be consumable without a module loader and publish ArmorEvents globally.
  const code = fs.readFileSync(path.join(root, "dist/armor-events.umd.js"), "utf8");
  const context = { self: {}, window: {} };
  vm.createContext(context);
  vm.runInContext(code, context);
  const globalArmorEvents =
    context.ArmorEvents || context.self.ArmorEvents || context.window.ArmorEvents;
  assert.equal(typeof globalArmorEvents, "function");
  assert.equal(typeof globalArmorEvents.Channel, "function");
})();
