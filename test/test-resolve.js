require('loud-rejection')();
const test = require('tape');
const path = require('path');
const resolve = require('../resolve');

const fixtures = path.resolve(__dirname, 'fixtures');

const run = (mainFields, expected, parent = 'pkg-fields') => {
  const defaultFields = [ 'browser', 'module', 'main' ];
  test(`should handle ${(mainFields || defaultFields).join(', ')}`, t => {
    t.plan(1);
    resolve('./' + parent, {
      mainFields,
      basedir: fixtures
    }, (err, file) => {
      if (err) return t.fail(err);
      t.equal(file, path.resolve(fixtures, `${parent}/${expected}`));
    });
  });
};

run(undefined, 'browser.js'); // default values

// kinda dumb but just permute each....

run([ 'browser', 'module', 'main' ], 'browser.js');
run([ 'browser', 'main', 'module' ], 'browser.js');
run([ 'browser', 'module' ], 'browser.js');
run([ 'browser', 'main' ], 'browser.js');
run([ 'browser' ], 'browser.js');

run([ 'module', 'browser', 'main' ], 'module.mjs');
run([ 'module', 'main', 'module' ], 'module.mjs');
run([ 'module', 'browser' ], 'module.mjs');
run([ 'module', 'main' ], 'module.mjs');
run([ 'module' ], 'module.mjs');

run([ 'main', 'browser', 'module' ], 'main.js');
run([ 'main', 'module', 'browser' ], 'main.js');
run([ 'main', 'browser' ], 'main.js');
run([ 'main', 'module' ], 'main.js');

// where some are missing
run([ 'main', 'browser', 'module' ], 'main.js', 'pkg-fields-missing-browser');
run([ 'module', 'browser', 'main' ], 'module.mjs', 'pkg-fields-missing-browser');
run([ 'browser', 'module', 'main' ], 'module.mjs', 'pkg-fields-missing-browser');
run([ 'browser', 'main', 'module' ], 'main.js', 'pkg-fields-missing-browser');

run([ 'browser', 'module', 'main' ], 'browser.js', 'pkg-fields-missing-module');
run([ 'module', 'main' ], 'main.js', 'pkg-fields-missing-module');
run([ 'main', 'module' ], 'main.js', 'pkg-fields-missing-module');
run([ 'main', 'browser' ], 'main.js', 'pkg-fields-missing-module');

test('should handle main only', t => {
  t.plan(1);
  resolve('./', {
    basedir: path.resolve(__dirname, '../')
  }, (err, file) => {
    if (err) return t.fail(err);
    t.equal(file, require.resolve('../'));
  });
});
