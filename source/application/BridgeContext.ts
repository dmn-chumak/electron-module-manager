import { BridgeRequestType } from './BridgeRequestType';
import { Vector } from './typedefs/Vector';

export interface BridgeContext {
    handle<RequestContent>(requestType:BridgeRequestType, handler:(content:RequestContent) => void):void;
    invoke<ModuleType>(moduleType:ModuleType, action:string, ...content:Vector<any>):Promise<any>;
}
