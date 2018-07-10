const babel = require('@babel/core');
const through = require('through2');
const { PassThrough } = require('stream');
const path = require('path');
const concat = require('concat-stream');
const duplexer = require('duplexer2');

const pluginDynamicImport = require('@babel/plugin-syntax-dynamic-import');
const pluginCJS = require('@babel/plugin-transform-modules-commonjs');
const pluginImportToRequire = require('babel-plugin-import-to-require');

module.exports = createTransform();
module.exports.createTransform = createTransform;

function createTransform (babelOpts = {}) {
  return function babelify (file, opts = {}) {
    const ext = path.extname(file);
    if (!babel.DEFAULT_EXTENSIONS.includes(ext)) {
      return new PassThrough();
    }

    if (typeof babelOpts.filterFile === 'function') {
      if (!babelOpts.filterFile(file, opts)) {
        return new PassThrough();
      }
    }

    const output = through();
    const stream = duplexer(concat(code => {
      code = code.toString();

      let isFilterAccept = true;
      if (typeof babelOpts.filterSource === 'function') {
        isFilterAccept = babelOpts.filterSource(code, file, opts);
      }

      // Skip files that don't use ES6 import/export syntax
      if (!isFilterAccept || !/(import|export)/g.test(code)) {
        output.push(code);
        output.push(null);
        return;
      }

      let plainImports = [].concat(babelOpts.plainImports).filter(Boolean);

      const settings = Object.assign({}, babelOpts, {
        babelrc: false,
        sourceMaps: 'inline',
        plugins: [
          plainImports.length > 0
            ? [ pluginImportToRequire, { modules: plainImports } ]
            : false,
          pluginDynamicImport,
          pluginCJS
        ].filter(Boolean),
        filename: file
      });

      delete settings.filterFile;
      delete settings.filterSource;
      delete settings.plainImports;

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
