import webpack from "webpack";
import gulp from "gulp";
import pkg from "./package.json";
import path from "path";
import WrapperPlugin from "wrapper-webpack-plugin";
import UglifyJSPlugin from "uglifyjs-webpack-plugin";
import Jasmine from "jasmine";

const isBeta = false;

// since webpack 4.0, webpack is built with UglifyJSPlugin if its mode is production.
var webpackConfig = {
  version: pkg.version,

  name: pkg.name,

  build(options) {
    let { mode = "none" } = options || {};
    let isDev = mode !== "production";
    let outputFilename = `${this.name}.js`;
    let outputPath = path.join(__dirname, isDev ? "build" : "dist");

    let entry = isBeta ? "./src/beta/index.js" : "./src/index.js";

    let plugins = [
      new WrapperPlugin({
        header: `// ${pkg.name} v${
          pkg.version
        } ${new Date().toDateString()}  \n`
      })
    ];
    if (!isDev) {
      plugins.unshift(new UglifyJSPlugin());
    }

    return {
      mode: "none", // it should not set mode into production, because the builtin uglifyjs plugin would remove header from bundle file that is added by WrapperPlugin.
      entry,
      output: {
        path: outputPath,
        filename: outputFilename,
        library: "ArmorEvents",
        libraryTarget: "umd",
        globalObject: 'typeof self !== "undefined" ? self : this'
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader",
              query: {
                presets: [["es2015", { loose: true }]]
              }
            }
          }
        ]
      },
      plugins
    };
  },

  release() {
    return this.build({ mode: "production" });
  }
};

function webpackRunner(options) {
  let { release } = options || {};
  return new Promise((resolve, reject) => {
    webpack(webpackConfig[release ? "release" : "build"](), (err, status) => {
      if (err) {
        reject(err);
      } else {
        resolve(status);
      }
    });
  });
}

gulp.task("release", () => webpackRunner({ release: true }));
gulp.task("default", () => webpackRunner());

gulp.task("test", cb => {
  let jasmine = new Jasmine();
  jasmine.loadConfigFile("spec/beta/jasmine.json");
  jasmine.onComplete(passed => {
    if (passed) {
      console.log("All specs have passed");
    } else {
      console.log("At least one spec has failed");
    }
    cb();
  });
  jasmine.execute();
});
