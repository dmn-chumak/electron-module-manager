import { BridgeRequestType } from './BridgeRequestType';
import { Vector } from './declarations/Vector';

export interface BridgeContext {
    appendHandler(requestType:string | BridgeRequestType, handler:(...content:Vector<any>) => void):void;

    appendHandlerOnce(requestType:string | BridgeRequestType, handler:(...content:Vector<any>) => void):void;

    removeHandler(requestType:string | BridgeRequestType, handler:(...content:Vector<any>) => void):void;

    invoke(requestType:string | BridgeRequestType, ...content:Vector<any>):Promise<any>;
}
