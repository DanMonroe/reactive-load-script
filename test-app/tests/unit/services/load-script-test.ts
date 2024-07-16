import { module, test } from 'qunit';
import { setupTest } from 'test-app/tests/helpers';
import LoadScriptService, {
  PREVENT_SCRIPT_LOADING_ID,
} from 'reactive-load-script/services/load-script';

const TEST_SCRIPT_SRC = 'http://fakescript.com/foo.js';

module('Unit | Service | inject-script', function (hooks) {
  setupTest(hooks);

  test('injectScript adds script to tracked scripts array', function (assert) {
    const service = this.owner.lookup(
      'service:load-script',
    ) as LoadScriptService;

    // Local tests will not find #prevent-script-loading so will
    // prevent script loading so it won't try to load the script in tests.
    service.injectScript({
      src: TEST_SCRIPT_SRC,
      checkForExisting: true,
      parentScriptTarget: PREVENT_SCRIPT_LOADING_ID,
    });

    const script = service.getScript(TEST_SCRIPT_SRC);

    assert.strictEqual(
      script?.src,
      TEST_SCRIPT_SRC,
      'injectScript added script to tracked scripts',
    );
  });

  test('injectScript adds additional attributes to script', function (assert) {
    const service = this.owner.lookup(
      'service:load-script',
    ) as LoadScriptService;

    const additionalLoadScriptAttributes = {
      foo: 'bar',
      anotherFoo: 'anotherBar',
    };

    service.injectScript({
      src: TEST_SCRIPT_SRC,
      checkForExisting: true,
      loadScriptAttributes: additionalLoadScriptAttributes,
      parentScriptTarget: PREVENT_SCRIPT_LOADING_ID,
    });

    const script = service.getScript(TEST_SCRIPT_SRC);

    assert.strictEqual(
      script?.scriptElement?.getAttribute('foo'),
      'bar',
      'injectScript adds foo attribute to script element',
    );
    assert.strictEqual(
      script?.scriptElement?.getAttribute('anotherFoo'),
      'anotherBar',
      'injectScript adds anotherFoo attribute to script element',
    );
  });
});
