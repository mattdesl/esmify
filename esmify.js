const babel = require('@babel/core');
const through = require('through2');
const { PassThrough } = require('stream');
const path = require('path');
const concat = require('concat-stream');
const duplexer = require('duplexer2');

const pluginDynamicImport = require('@babel/plugin-syntax-dynamic-import');
const pluginCJS = require('@babel/plugin-transform-modules-commonjs');
const pluginImportToRequire = require('babel-plugin-import-to-require');

// Babel's import inter-op breaks with a select few modules that need
// simpler syntax for static analysis. The following hack is very presumptuous
// but the goal of this module is to make things "just work" without configuration,
// even if it means there's a bit of magic. At some point perhaps Babels' inter-op
// will be able to mangle the code a bit less, or glslify and similar static-module
// tools will be able to parse babel's inter-op code.
const commonJSModules = [
  'glslify'
];

module.exports = createTransform();
module.exports.createTransform = createTransform;

function createTransform (babelOpts = {}) {
  return function babelify (file, opts = {}) {
    const ext = path.extname(file);
    if (!babel.DEFAULT_EXTENSIONS.includes(ext)) return new PassThrough();

    const output = through();
    const stream = duplexer(concat(code => {
      code = code.toString();

      // Skip files that don't use ES6 import/export syntax
      if (!/(import|export)/g.test(code)) {
        output.push(code);
        output.push(null);
        return;
      }

      const settings = Object.assign({}, babelOpts, {
        babelrc: false,
        sourceMaps: 'inline',
        plugins: [
          [ pluginImportToRequire, { modules: commonJSModules } ],
          pluginDynamicImport,
          pluginCJS
        ],
        filename: file
      });

      babel.transform(code, settings, (err, result) => {
        if (err) {
          stream.emit('error', err);
        } else {
          output.push(result.code);
        }
        output.push(null);
      });
    }), output);
    return stream;
  };
}
