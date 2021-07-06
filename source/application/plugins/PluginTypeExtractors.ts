import { Plugin } from './Plugin';

export type PluginStateExtractor<Type> = (Type extends Plugin ? Type['state'] : any);

export type PluginContext<Type> = Omit<Type, keyof Plugin>;
