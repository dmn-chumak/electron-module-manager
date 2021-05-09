import { WindowBaseOptions } from './WindowBaseOptions';
import { WindowState } from './WindowState';

export interface WindowOptions<ModuleType extends number, ModuleState = any> extends WindowBaseOptions {
    moduleInitialState?:Readonly<ModuleState>;
    moduleType:ModuleType;
    initialState?:Readonly<WindowState>;
}
