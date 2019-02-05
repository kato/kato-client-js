import * as mergeOptions from 'merge-options';
import {defaultDispatcher, Dispatcher} from "./dispatcher";

export type KatoClientOptions = {
  dispatcher?: Dispatcher
  cacheStub?: boolean
}

const defaultOptions: KatoClientOptions = {
  dispatcher: defaultDispatcher,
  cacheStub: true,
};

export function getOptions(options: KatoClientOptions): KatoClientOptions {
  return mergeOptions(defaultOptions, options)
}
