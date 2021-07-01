import { AbstractModule } from './Module';
import { AbstractModuleView } from './ModuleView';

export type ModuleStateExtractor<Type> = (Type extends AbstractModule<infer ModuleState> ? ModuleState : any);

export type ModuleViewMethodsExtractor<Type> = Omit<Type, keyof AbstractModuleView>;

export type ModuleMethodsExtractor<Type> = Omit<Type, keyof AbstractModule>;
