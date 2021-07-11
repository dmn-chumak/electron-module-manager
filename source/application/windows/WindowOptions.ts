import { WindowBaseOptions } from './WindowBaseOptions';

export interface WindowOptions<ModuleState = any> extends WindowBaseOptions {
    moduleInitialState:Readonly<ModuleState>;
    moduleType:string;
    channelIndex:number;
}
