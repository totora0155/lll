import path from 'path';
import test from 'ava';
import toArray from 'stream-to-array';
import lll from '..';
const {Component} = lll;

test.beforeEach(t => {
  t.context = {
    base: new Component('html/base.html'),
    index: new Component('html/index.html')
  };
});

test('stream file', async t => {
  lll(t.context.base, t.context.index)
  .then(stream => {
    toArray(stream, (err, arr) => {
      if (err !== null) {
        console.log(err);
      }
      t.is(arr[0].history[0], path.resolve('html/index.html'));
      t.regex(arr[0].contents.toString(), /<html>/);
      t.regex(arr[0].contents.toString(), /<p>foo<\/p>/);
    });
  });
});
