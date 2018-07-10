# esmify

A dead-simple tool to add `import` / `export` ES Module syntax for [browserify](https://www.npmjs.com/package/browserify).

This plugin does the following to your bundler:

- Adds `.mjs` extension (which takes precedence)
- Resolves to `"module"` field when `"browser"` field is not defined
- Transforms ES Module syntax (static `import` / `export` statements) into CommonJS across your entire bundle (to ensure that ESM authored modules will work)

Here's how you use it:

```js
browserify index.js -p esmify > bundle.js
```

Also works with [budo](https://www.npmjs.com/package/budo), for example:

```js
budo index.js --live -- -p esmify
```

The plugin ignores dynamic import expressions and skips files that don't include `import` / `export` expressions to maintain performance.

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
- `plainImports` (Experimental) this feature will map named imports *directly* to their CommonJS counterparts, without going through Babel's inter-op functions. This is generally needed for static analysis of `fs`, `path` and other tools like `glslify` in browserify. Defaults to `[ 'fs', 'path', 'glslify' ]`.

## How it Works

Under the hood, this is using Babel with a couple plugins specific to CommonJS/import/export.

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/esmify/blob/master/LICENSE.md) for details.
