import { Module } from './Module';

export type ModuleStateExtractor<Type> = (Type extends Module ? Type['state'] : any);

export type ModuleContext<Type> = Omit<Type, keyof Module>;
