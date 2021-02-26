import { ModuleView } from './ModuleView';
import { Class } from './typedefs/Class';
import { Dictionary } from './typedefs/Dictionary';
import { WindowBaseOptions } from './WindowBaseOptions';
import { WindowState } from './WindowState';

export interface WindowOptions<ModuleType extends number, ModuleState = any> extends WindowBaseOptions {
    moduleViewMap?:Dictionary<Class<ModuleView<ModuleType>>>;
    moduleInitialState?:Readonly<ModuleState>;
    moduleType:ModuleType;
    initialState?:Readonly<WindowState>;
}
