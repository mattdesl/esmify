# esmify

A dead-simple tool to add `import` / `export` ES Module syntax for [browserify](https://www.npmjs.com/package/browserify).

Example, using `-g` (for `--global-transform`) to also transform `node_modules` dependencies that may have been authored with ESM syntax.

```js
browserify index.js -g esmify > bundle.js
```

Also works with [budo](https://www.npmjs.com/package/budo), for example:

```js
budo index.js --live -- -g esmify
```

This will transform static `import` / `export` statements across your entire bundle into a CommonJS format. The transform ignores dynamic import expressions, and skips files that don't include the format.

## Install

Use [npm](https://npmjs.com/) to install.

```sh
npm install esmify --save-dev
```

Then use it as a global transform in browserify with `-g`, or a local transform (which ignores `node_modules`) with `-t`. You can also use it from the browserify API like so:

```js
browserify({
  transform: [
    [ require('esmify'), { global: true } ]
  ]
});
```

## Usage

#### `tr = esmify(file)`

Returns a transform stream that takes ES Module syntax and transforms it into CommonJS module syntax, using the specfieid `file` path of the module being transformed.

## How it Works

Under the hood, this is using Babel with a couple plugins specific to CommonJS/import/export.

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/esmify/blob/master/LICENSE.md) for details.
