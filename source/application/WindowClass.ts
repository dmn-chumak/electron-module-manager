import { Application } from './Application';
import { Class } from './declarations/Class';
import { Module } from './Module';
import { Window } from './Window';
import { WindowBaseOptions } from './WindowBaseOptions';

export type WindowClass<ModuleType extends number, ModuleState = any> = (
    Class<Window<ModuleType, ModuleState>, [
        Application<ModuleType>,
        WindowBaseOptions,
        ModuleType,
        Module<ModuleType, ModuleState>,
        Window<ModuleType>
    ]>
);
