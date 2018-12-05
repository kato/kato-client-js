import * as mergeOptions from 'merge-options';
import {defaultDispatcher, Dispatcher} from "./dispatcher";

export type KatoClientOptions = {
  dispatcher?: Dispatcher
}

const defaultOptions: KatoClientOptions = {
  dispatcher: defaultDispatcher
};

export function getOptions(options: KatoClientOptions): KatoClientOptions {
  return mergeOptions(defaultOptions, options)
}
