import { Module } from './Module';

export type ModuleStateExtractor<Type> = (Type extends Module<infer ModuleState> ? ModuleState : any);

export type ModuleContext<Type> = Omit<Type, keyof Module>;
