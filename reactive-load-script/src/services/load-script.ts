import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type { InjectScriptArgs } from '../../declarations';

export const PREVENT_SCRIPT_LOADING_ID = '#prevent-script-loading';

type ErrorState = ErrorEvent | null;

const isBrowser =
  typeof window !== 'undefined' && typeof window.document !== 'undefined';

export class Script {
  @tracked src: string | undefined = undefined;
  @tracked loading: boolean = false;
  @tracked error: ErrorState = null;
  @tracked scriptElement: HTMLScriptElement | null = null;
  @tracked scriptLoaded: boolean = false;
  constructor({
    src = undefined,
    loading = false,
    error = null,
    scriptElement = null,
    scriptLoaded = false,
  }: {
    src?: string;
    loading?: boolean;
    error?: ErrorState;
    scriptElement?: HTMLScriptElement | null;
    scriptLoaded?: boolean;
  } = {}) {
    this.src = src;
    this.error = error;
    this.loading = loading;
    this.scriptElement = scriptElement;
    this.scriptLoaded = scriptLoaded;
  }

  handleLoad = () => {
    this.loading = false;
    this.scriptLoaded = true;
    this.removeListeners();
  };

  handleError = (error: ErrorEvent) => {
    this.error = error;
    this.removeListeners();
  };

  addListeners = () => {
    this.scriptElement?.addEventListener('load', this.handleLoad);
    this.scriptElement?.addEventListener('error', this.handleError);
  };

  removeListeners = () => {
    this.scriptElement?.removeEventListener('load', this.handleLoad);
    this.scriptElement?.removeEventListener('error', this.handleError);
  };
}

export default class LoadScriptService extends Service {
  trackedScriptsStatusArray: Script[] = [];

  getScript(src: string): Script | undefined {
    return this.trackedScriptsStatusArray.find((script: Script) => {
      return script.src === src;
    });
  }

  // Check for existing <script> tags with this src. If so, update scripts[src]
  // and return the new script; otherwise, return undefined.
  checkExisting = (src: string): Script | undefined => {
    const scriptElementInDom: HTMLScriptElement | null = document.querySelector(
      `script[src="${src}"]`,
    );

    if (scriptElementInDom) {
      // Assume existing <script> tag is already loaded,
      // and cache that data for future use.
      const thisScriptsStatus = this.getScript(src);

      if (thisScriptsStatus) {
        thisScriptsStatus.loading = false;
        thisScriptsStatus.error = null;
        thisScriptsStatus.scriptElement = scriptElementInDom;
      }
      return thisScriptsStatus;
    }
    return undefined;
  };

  injectScript({
    src,
    checkForExisting,
    loadScriptAttributes,
    parentScriptTarget,
  }: InjectScriptArgs): void {
    // Check whether some instance of this hook considered this src.
    let newScript: Script | undefined = this.getScript(src);

    // If requested, check for existing <script> tags with this src
    // (unless we've already loaded the script ourselves).
    if (!newScript && checkForExisting && src && isBrowser) {
      newScript = this.checkExisting(src);
    }

    // No browser, or if no src specified, or
    // if script is already loaded or "error" state.
    if (!isBrowser || !src || newScript?.scriptLoaded || newScript?.error) {
      return;
    }

    let newScriptElement: HTMLScriptElement | null;
    if (newScript) {
      newScriptElement = newScript.scriptElement;
    } else {
      newScriptElement = document.createElement('script') as HTMLScriptElement;
      newScriptElement.src = src;

      // set additional passed in attributes
      if (loadScriptAttributes) {
        for (const [key, value = ''] of Object.entries(loadScriptAttributes)) {
          newScriptElement.setAttribute(key, value);
        }
      }

      const newStatus = new Script({
        src,
        loading: true,
        error: null,
        scriptElement: newScriptElement,
      });
      newScript = newStatus;
      this.trackedScriptsStatusArray.push(newStatus);
    }

    // `newScript` is now guaranteed to be defined: either the old newScript
    // from a previous load, or a newly created one.
    // Local tests will not find #prevent-script-loading so will
    // prevent script loading so it won't try to load the script in tests.
    if (newScriptElement && parentScriptTarget !== PREVENT_SCRIPT_LOADING_ID) {
      newScript.addListeners();

      const parentElement = document.querySelector(
        parentScriptTarget ?? 'body',
      );

      // Append the <script> element to the DOM.
      parentElement?.appendChild(newScriptElement);
    }
  }
}

declare module '@ember/service' {
  interface Registry {
    loadScriptService: LoadScriptService;
  }
}
