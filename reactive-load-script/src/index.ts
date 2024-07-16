export {
  default as LoadScriptService,
  Script,
} from 'reactive-load-script/services/load-script';

export interface InjectScriptArgs {
  src: string;
  checkForExisting: boolean;
  loadScriptAttributes?: Record<string, string>;
  parentScriptTarget?: string;
}

export interface PlainObject<T = unknown> {
  [key: string]: T;
}
