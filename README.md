# esmify

A dead-simple tool to add `import` / `export` ES Module syntax to your [browserify](https://www.npmjs.com/package/browserify) builds.

The plugin makes the following changes to your bundler:

- Adds `.mjs` extension to module resolution (which take precedence over `.js` files)
- Resolves to `"module"` field in `package.json` when a `"browser"` field is not specified
- Transforms ES Module syntax (static `import` / `export` statements) into CommonJS

Use it with the `--plugin` or `-p` flags in browserify:

```js
browserify index.js -p esmify > bundle.js
```

Also works with [budo](https://www.npmjs.com/package/budo) and similar tools, for example:

```js
budo index.js --live -- -p esmify
```

Files that don't contain `import` / `export` syntax are ignored, as are dynamic import expressions. The plugin runs across your bundle (including `node_modules`) in order to support ESM-authored modules on npm.

## Install

Use [npm](https://npmjs.com/) to install.

```sh
npm install esmify --save-dev
```

Also can be used via API like so:

```js
browserify({
  plugin: [
    [ require('esmify'), { /* ... options ... */ } ]
  ]
});
```

## Usage

#### `plugin = esmify(bundler, opt = {})`

Returns a browswerify plugin function that operates on `bundler` with the given options:

- `mainFields` which describes the order of importance of fields in package.json resolution, defaults to `[ 'browser', 'module', 'main' ]`
- `nodeModules` (default `true`) to disable the transform on your `node_modules` tree, set this to `false`. This will speed up bundling but you may run into issues when trying to import ESM-published code from npm.
- `plainImports` (Experimental) this feature will map named imports *directly* to their CommonJS counterparts, without going through Babel's inter-op functions. This is generally needed for static analysis of `fs`, `path` and other tools like `glslify` in browserify. Defaults to `[ 'fs', 'path', 'glslify' ]`.

Under the hood, this uses Babel and `plugin-transform-modules-commonjs` to provide robust inter-op that handles a variety of use cases.

#### `require('esmify/resolve')(id, opts, cb)`

Resolve the given `id` using the module resolution algorithm from `esmify`, accepting `{ mainFields }` array to opts as well as other options passed to [resolve](https://www.npmjs.com/package/resolve) and [browser-resolve](https://www.npmjs.com/package/browser-resolve).

Works like so:

- If mainFields includes a `"browser"` field, use `browser-resolve`, otherwise use `resolve`
- Look for package.json fields in order of `mainFields`, the first field that exists will be used

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/esmify/blob/master/LICENSE.md) for details.
