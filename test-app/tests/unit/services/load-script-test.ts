import { module, test } from 'qunit';
import { setupTest } from 'test-app/tests/helpers';

module('Unit | Service | load-script', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    const service = this.owner.lookup('service:load-script');
    assert.ok(service);
  });
});
