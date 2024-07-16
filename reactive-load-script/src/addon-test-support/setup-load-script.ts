import { getContext, settled, type TestContext } from '@ember/test-helpers';
import LoadScriptService, { Script } from 'reactive-load-script/services/load-script';
import type { PlainObject } from 'reactive-load-script';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type NestedHooks from 'ember-qunit';

let loadScriptService: LoadScriptService | undefined;
// let injectScriptOriginal: (args: InjectScriptArgs) => void;
// let getScriptOriginal: (src: string) => Script | undefined;

export function setupLoadScript(hooks: NestedHooks, setupLoadScriptOptions: PlainObject = {}): void {
  hooks.beforeEach(async function (this: TestContext) {
    const { owner } = getContext() as TestContext;

    loadScriptService = owner.lookup('service:load-script') as LoadScriptService;

    loadScriptService.injectScript = () => {};

    // loading: false,
    // error: null,
    // scriptLoaded: true,

    loadScriptService.getScript = (src) => {
      let getScriptOptions = {...{
        src,
      }, ...setupLoadScriptOptions};

      let fakeScript = new Script(getScriptOptions);

      return fakeScript;
    };
  });

  hooks.afterEach(function () {
    // loadScriptService.injectScript = injectScriptOriginal;
    // loadScriptService.getScript = getScriptOriginal;
    loadScriptService = undefined;
  });

}
