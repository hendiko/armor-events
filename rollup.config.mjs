import { createRequire } from "node:module";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

const banner = `// ${pkg.name} v${pkg.version}`;

const ts = () =>
  typescript({
    tsconfig: "./tsconfig.rollup.json",
  });

const umdOutput = {
  format: "umd",
  name: "ArmorEvents",
  exports: "default",
  banner,
};

export default [
  {
    input: "src/index.ts",
    output: {
      file: "dist/armor-events.mjs",
      format: "esm",
      banner,
    },
    plugins: [ts()],
  },
  {
    input: "src/cjs.ts",
    output: {
      file: "dist/armor-events.cjs",
      format: "cjs",
      exports: "default",
      banner,
    },
    plugins: [ts()],
  },
  {
    input: "src/cjs.ts",
    output: {
      ...umdOutput,
      file: "dist/armor-events.umd.js",
    },
    plugins: [ts()],
  },
  {
    input: "src/cjs.ts",
    output: {
      ...umdOutput,
      file: "dist/armor-events.umd.min.js",
      plugins: [terser()],
    },
    plugins: [ts()],
  },
];
