import { AbstractPlugin } from './Plugin';
import { AbstractPluginView } from './PluginView';

export type PluginStateExtractor<Type> = (Type extends AbstractPlugin<infer PluginState> ? PluginState : any);

export type PluginViewMethodsExtractor<Type> = Omit<Type, keyof AbstractPluginView>;

export type PluginMethodsExtractor<Type> = Omit<Type, keyof AbstractPlugin>;
