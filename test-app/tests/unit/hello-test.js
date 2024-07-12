import { setupTest } from '../helpers';
import { module, test } from 'qunit';

module('Unit | hello', function (hooks) {
  setupTest(hooks);

  test('unit test runs', function (assert) {
    assert.ok(true, 'Unit test runs successfully');
  });
});
