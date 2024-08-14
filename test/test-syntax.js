require('loud-rejection')();
const test = require('tape');
const path = require('path');
const browserify = require('browserify');

const run = (file, opt = {}) => {
  return new Promise((resolve, reject) => {
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
};

test('should not bail on fancy new syntax', async t => {
  t.plan(1);
  try {
    const result = await run('./fixtures/no-import-with-syntax.js');
    t.equal(result.trim(), `
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module \'"+i+"\'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

const obj = {
  ...{
    other: 2
  },
  foo: 'bar'
};
async function* agf() {
  await 1;
}
const a = async () => {};
import('./foo.js');

// this will trigger our naive transform!
console.log('export');

},{}]},{},[1]);
`.trim());
  } catch (err) {
    t.fail(err);
  }
});
