const resolve = require('./resolve');
const { createTransform } = require('./transform');
const path = require('path');
const through = require('through2');
const relativePath = require('cached-path-relative');

module.exports = function (bundler, pluginOpts = {}) {
  const cwd = pluginOpts.basedir || process.cwd();
  const logFile = pluginOpts.logFile;
  let defaultMainField = [ 'browser', 'module', 'main' ];

  // TODO: Consider a better way to handle this.
  // Babel's import inter-op breaks certain modules being able to statically
  // analyze require statements; for example brfs and glslify.
  // This hack/workaround will *directly* translate certain known CommonJS
  // modules without going through inter-op.
  const plainImports = [ 'fs', 'path', 'glslify' ];

  // User is disabling browser-field
  if (bundler._options.browserField === false) {
    defaultMainField = defaultMainField.filter(d => d !== 'browser');
  }

  // We need to add in the .mjs and make it take precedence over .js files
  const idx = bundler._extensions.indexOf('.mjs');
  if (idx >= 0) bundler._extensions.splice(idx, 1);
  bundler._extensions.unshift('.mjs');

  const mainFields = pluginOpts.mainFields || defaultMainField;

  // Utility -> true if path is a top-level node_modules (i.e. not in source)
  const isNodeModule = (file, cwd) => {
    const dir = path.dirname(file);
    const relative = relativePath(cwd, dir);
    return relative.startsWith(`node_modules${path.sep}`);
  };

  // Patch browserify resolve algorithm
  bundler._bresolve = function (id, opts, cb) {
    opts = Object.assign({}, opts, {
      mainFields,
      basedir: opts.basedir || path.dirname(opts.filename)
    });
    return resolve(id, opts, (err, result, pkg) => {
      if (err) {
        // Provide cleaner error messaging for end-user
        return cb(new Error(`Cannot find module '${id}' from '${path.relative(cwd, opts.filename)}'`));
      } else {
        cb(null, result, pkg);
      }
    });
  };

  // Insert esmify as the *initial* transform
  let firstRecord = true;
  bundler.pipeline.get('record').unshift(through.obj(function (chunk, enc, next) {
    if (firstRecord) {
      firstRecord = false;

      // We need two transforms to ensure they are run before all other browserify
      // transforms passed in via transform field and so forth.
      // 1st is a regular local transform
      this.push({
        transform: createTransform({ plainImports, logFile, filterFile: file => !isNodeModule(file, cwd) }),
        global: false
      });
      // 2nd is a global transform, but *only* running in node_modules, since
      // the above local transform already catches local files.
      if (pluginOpts.nodeModules !== false) {
        this.push({
          transform: createTransform({ plainImports, logFile, filterFile: file => isNodeModule(file, cwd) }),
          global: true
        });
      }

      next(null, chunk);
    } else {
      next(null, chunk);
    }
  }));
};
