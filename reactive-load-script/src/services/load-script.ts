import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

type ErrorState = ErrorEvent | null;

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

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
  // and return the new status; otherwise, return undefined.
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

  useScript({
    src,
    checkForExisting,
    loadScriptAttributes,
  }: {
    src: string;
    checkForExisting: boolean;
    loadScriptAttributes?: Record<string, string>;
  }): void {
    // Check whether some instance of this hook considered this src.
    // let status: Script | undefined = this.Script;
    let status: Script | undefined = this.getScript(src);

    // If requested, check for existing <script> tags with this src
    // (unless we've already loaded the script ourselves).
    if (!status && checkForExisting && src && isBrowser) {
      status = this.checkExisting(src);
    }

    // Nothing to do on server, or if no src specified, or
    // if script is already loaded or "error" state.
    if (!isBrowser || !src || status?.scriptLoaded || status?.error) {
      return;
    }

    let newScriptElement: HTMLScriptElement | null;
    if (status) {
      newScriptElement = status.scriptElement;
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
      status = newStatus;
      this.trackedScriptsStatusArray.push(newStatus);
    }

    // `status` is now guaranteed to be defined: either the old status
    // from a previous load, or a newly created one.
    if (newScriptElement) {
      status.addListeners();

      // Append the <script> element to the DOM.
      document.body.appendChild(newScriptElement);
    }
  }
}
