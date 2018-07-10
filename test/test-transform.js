require('loud-rejection')();
const test = require('tape');
const path = require('path');
const vm = require('vm');
const browserify = require('browserify');

const run = async (file) => {
  const bundle = await new Promise((resolve, reject) => {
    browserify(path.resolve(__dirname, file), {
      transform: [
        [ require('../transform'), { global: true } ]
      ]
    }).bundle((err, src) => {
      if (err) {
        return reject(err);
      }
      resolve(src.toString());
    });
  });

  return new Promise(resolve => {
    vm.runInNewContext(bundle, {
      console: {
        log: (...args) => resolve(args.join(' '))
      }
    });
  });
};

test('should handle default export', async t => {
  t.plan(1);
  try {
    const result = await run('./fixtures/import-default');
    t.equal(result, 'foo');
  } catch (err) {
    t.fail(err);
  }
});

test('should ignore JSON', async t => {
  t.plan(1);
  try {
    const result = await run('./fixtures/import-json.js');
    t.equal(result, 'bar bar');
  } catch (err) {
    t.fail(err);
  }
});

test('should handle named export', async t => {
  t.plan(1);
  try {
    const result = await run('./fixtures/import-named');
    t.equal(result, 'baz');
  } catch (err) {
    t.fail(err);
  }
});

test('should handle "esm" authored module using CJS', async t => {
  t.plan(1);
  try {
    const result = await run('./fixtures/import-esm-with-cjs');
    t.equal(result, 'hello');
  } catch (err) {
    t.fail(err);
  }
});

test('should handle "esm" authored module using ES6', async t => {
  t.plan(1);
  try {
    const result = await run('./fixtures/import-esm');
    t.equal(result, 'hello');
  } catch (err) {
    t.fail(err);
  }
});

test('should handle wildcard import', async t => {
  t.plan(1);
  try {
    const result = await run('./fixtures/import-wildcard');
    t.equal(result, '2 cool');
  } catch (err) {
    t.fail(err);
  }
});

// Test doesn't yet work in Node.js but this at least works in browser.
// test('should not fail on dynamic import', async t => {
//   t.plan(1);
//   try {
//     const result = await run('./fixtures/import-dynamic');
//     t.equal(result, '2 cool');
//   } catch (err) {
//     t.fail(err);
//   }
// });
