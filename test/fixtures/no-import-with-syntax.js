const obj = {
  ...{ other: 2 },
  foo: 'bar'
};

async function* agf() {
  await 1;
}

const a = async () => {};

import('./foo.js');

// this will trigger our naive transform!
console.log('export');
