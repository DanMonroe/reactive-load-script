import { setupTest } from '../helpers';
import { module, test } from 'qunit';

module('Unit | hello', function (hooks) {
  setupTest(hooks);

  test('unit test runs', function (assert) {
    assert.ok(true, 'Unit test runs successfully');
  });

  test('load-script service', function (assert) {
    let service = this.owner.lookup('service:load-script');
    console.log('service', service);

    assert.ok(true, 'Service looked up');
  });
});
