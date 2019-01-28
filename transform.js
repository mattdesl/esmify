const babel = require('@babel/core');
const through = require('through2');
const { PassThrough } = require('stream');
const path = require('path');
const concat = require('concat-stream');
const duplexer = require('duplexer2');

const pluginDynamicImport = require('@babel/plugin-syntax-dynamic-import');
const pluginCJS = require('@babel/plugin-transform-modules-commonjs');
const pluginImportToRequire = require('babel-plugin-import-to-require');

// Gotta add these as well so babel doesn't bail out when it sees new syntax
const pluginSyntaxRestSpread = require('@babel/plugin-syntax-object-rest-spread');
const pluginSyntaxGenerator = require('@babel/plugin-syntax-async-generators');

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

    if (babelOpts.logFile) console.log('Checking', file);

    const output = through();
    const stream = duplexer(concat(code => {
      code = code.toString();

      let isFilterAccept = true;
      if (typeof babelOpts.filterSource === 'function') {
        isFilterAccept = babelOpts.filterSource(code, file, opts);
      }

      // Skip files that don't use ES6 import/export syntax
      if (!isFilterAccept || !/\b(import|export)\b/g.test(code)) {
        output.push(code);
        output.push(null);
        return;
      }

      let plainImports = [].concat(babelOpts.plainImports).filter(Boolean);

      const settings = Object.assign({}, babelOpts, {
        babelrc: false,
        sourceMaps: 'inline',
        plugins: [
          pluginSyntaxRestSpread,
          pluginSyntaxGenerator,
          plainImports.length > 0
            ? [ pluginImportToRequire, { modules: plainImports } ]
            : false,
          pluginDynamicImport,
          pluginCJS
        ].filter(Boolean),
        filename: file
      });

      if (babelOpts.logFile) console.log('Transforming', file);

      delete settings.filterFile;
      delete settings.filterSource;
      delete settings.logFile;
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
