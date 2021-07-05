import { Plugin } from './Plugin';

export type PluginStateExtractor<Type> = (Type extends Plugin<infer PluginState> ? PluginState : any);

export type PluginContext<Type> = Omit<Type, keyof Plugin>;
