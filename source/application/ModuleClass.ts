import { Module } from './Module';
import { Class } from './typedefs/Class';
import { WindowBaseOptions } from './WindowBaseOptions';

export type ModuleClass<ModuleType extends number, ModuleState = any> = Class<Module<ModuleType, ModuleState>> & {
    createWindowOptions():Partial<WindowBaseOptions>;
};
