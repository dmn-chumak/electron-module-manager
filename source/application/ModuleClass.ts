import { Application } from './Application';
import { Class } from './declarations/Class';
import { Module } from './Module';

export type ModuleClass<ModuleType extends number, ModuleState = any> = (
    Class<Module<ModuleType, ModuleState>, [
        Application<ModuleType>,
        ModuleState
    ]>
);
