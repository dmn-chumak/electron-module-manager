import { WindowBaseOptions } from './WindowBaseOptions';

export interface WindowOptions<ModuleState = any> extends WindowBaseOptions {
    moduleInitialState:Readonly<ModuleState>;
    moduleType:number;
    channelIndex:number;
}
