require('loud-rejection')();
const test = require('tape');
const path = require('path');
const vm = require('vm');
const browserify = require('browserify');

const run = async (file, opt = {}) => {
  const bundle = await new Promise((resolve, reject) => {
    browserify(path.resolve(__dirname, file), {
      plugin: [
        [ require('../'), opt.plugin || {} ]
      ],
      ...opt.browserify
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

test('should ESM import builtins', async t => {
  t.plan(1);
  try {
    const result = await run('./fixtures/import-builtin.js');
    t.equal(result, '2 cool');
  } catch (err) {
    t.fail(err);
  }
});

test('should ESM import with transforms', async t => {
  t.plan(1);
  try {
    const result = await run('./fixtures/import-with-glslify.js', {
      browserify: {
        transform: [ 'glslify' ]
      }
    });
    t.equal(result, 'shader: #define GLSLIFY 1\nvoid main () {}');
  } catch (err) {
    t.fail(err);
  }
});

test('should ESM import with brfs', async t => {
  t.plan(1);
  try {
    const result = await run('./fixtures/import-with-brfs.js', {
      browserify: {
        transform: [ 'brfs' ]
      }
    });
    t.equal(result, 'void main () { /* test */ }');
  } catch (err) {
    t.fail(err);
  }
});

test('should ESM import with transforms', async t => {
  t.plan(1);
  try {
    const result = await run('./fixtures/import-with-glslify-2.js', {
      browserify: {
        transform: [ 'glslify' ]
      }
    });
    t.equal(result, 'shader2: #define GLSLIFY 1\nvoid main () { /* test */ }');
  } catch (err) {
    t.fail(err);
  }
});

test('should handle browser field by default from node', async t => {
  t.plan(1);
  try {
    const result = await run('./fixtures/import-pkg-field');
    t.equal(result, 'hello browser');
  } catch (err) {
    t.fail(err);
  }
});

test('should handle browserify --node option', async t => {
  t.plan(1);
  try {
    const result = await run('./fixtures/import-pkg-field', {
      browserify: {
        node: true
      }
    });
    t.equal(result, 'hello mjs');
  } catch (err) {
    t.fail(err);
  }
});

test('should handle mainFields option', async t => {
  t.plan(1);
  try {
    const result = await run('./fixtures/import-pkg-field', {
      plugin: {
        mainFields: [ 'module', 'main' ]
      }
    });
    t.equal(result, 'hello mjs');
  } catch (err) {
    t.fail(err);
  }
});

test('should handle mjs by default', async t => {
  t.plan(1);
  try {
    const result = await run('./fixtures/export-default-object');
    t.equal(result, 'hellobar');
  } catch (err) {
    t.fail(err);
  }
});

test('the js points elsewhere', async t => {
  t.plan(1);
  try {
    const result = await run('./fixtures/export-default-object.js');
    t.equal(result, 'invalid');
  } catch (err) {
    t.fail(err);
  }
});

test('imports wcag-contrast', async t => {
  t.plan(1);
  try {
    const result = await run('./fixtures/import-contrast.js');
    t.equal(result, '3');
  } catch (err) {
    t.fail(err);
  }
});

test('require()s wcag-contrast', async t => {
  t.plan(1);
  try {
    const result = await run('./fixtures/require-contrast.js');
    t.equal(result, '3');
  } catch (err) {
    t.fail(err);
  }
});
