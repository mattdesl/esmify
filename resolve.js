const browserResolve = require('browser-resolve');
const nodeResolve = require('resolve');

module.exports = function (id, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }
  opts = opts || {};

  const mainFields = opts.mainFields || [ 'browser', 'module', 'main' ];
  const isBrowserResolve = mainFields.includes('browser');
  const resolve = isBrowserResolve ? browserResolve : nodeResolve;

  const packageFilter = opts.packageFilter;
  opts = Object.assign({}, opts, {
    extensions: [ '.mjs', '.js' ],
    packageFilter: function (info, pkgdir) {
      if (packageFilter) info = packageFilter(info, pkgdir);

      const key = isBrowserResolve ? 'browser' : 'main';
      for (let i = 0; i < mainFields.length; i++) {
        const target = mainFields[i];
        let replacement = info[target];

        // Special case to handle legacy browserify, taken from node-browser-resolve
        if (!replacement && target === 'browser' && typeof info.browserify === 'string') {
          replacement = info.browserify;
        }

        // We have a replacement, stop searching and assign it
        if (replacement) {
          info[key] = replacement;
          break;
        }

        // Otherwise we look for the next field...
      }
      return info;
    }
  });
  delete opts.mainFields;
  return resolve(id, opts, cb);
};
