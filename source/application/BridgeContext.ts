import { BridgeRequestType } from './BridgeRequestType';
import { Vector } from './typedefs/Vector';

export interface BridgeContext {
    appendHandler<ContentType>(requestType:string | BridgeRequestType, handler:(content:ContentType) => void):void;

    appendHandlerOnce<ContentType>(requestType:string | BridgeRequestType, handler:(content:ContentType) => void):void;

    removeHandler<ContentType>(requestType:string | BridgeRequestType, handler:(content:ContentType) => void):void;

    invoke(action:string, ...content:Vector<any>):Promise<any>;
}
