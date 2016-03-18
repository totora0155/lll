import test from 'ava';
import lll from '..';

test.beforeEach((t) => {
  t.context = {
    base: new lll.Renderer('html/base.html'),
    index: new lll.Renderer('html/index.html'),
  };
});

test('file', async (t) => {
  const [result] = await lll(t.context.base, t.context.index);

  t.is(result.stem, 'index');
  t.is(result.base, process.cwd() + '/html');
  t.is(result.relative, 'index.html');
});
