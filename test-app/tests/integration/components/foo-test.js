import { module, test } from 'qunit';
import { setupRenderingTest } from '../../helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | pretty-color', function (hooks) {
  setupRenderingTest(hooks);

  test('foo', async function (assert) {
    await render(hbs`<Foo />`);

    assert.ok(false, 'no foo for you');
  });
});
