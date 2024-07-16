import { getContext, type TestContext } from '@ember/test-helpers';
import LoadScriptService, {
  Script,
} from 'reactive-load-script/services/load-script';
import type { PlainObject } from 'reactive-load-script';

let loadScriptService: LoadScriptService | undefined;

export function setupLoadScript(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hooks: any,
  setupLoadScriptOptions: PlainObject = {},
): void {
  hooks.beforeEach(async function (this: TestContext) {
    const { owner } = getContext() as TestContext;

    loadScriptService = owner.lookup(
      'service:load-script',
    ) as LoadScriptService;

    loadScriptService.injectScript = () => {};

    loadScriptService.getScript = (src) => {
      const getScriptOptions = {
        ...{
          src,
        },
        ...setupLoadScriptOptions,
      };

      return new Script(getScriptOptions);
    };
  });

  hooks.afterEach(function () {
    loadScriptService = undefined;
  });
}
