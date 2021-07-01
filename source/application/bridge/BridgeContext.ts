import { Vector } from '../Vector';

export interface BridgeContext {
    appendEventListener(requestType:string, handler:(...content:Vector<any>) => void):number;

    appendEventListenerOnce(requestType:string, handler:(...content:Vector<any>) => void):number;

    removeEventListener(requestType:string, index:number):void;

    invokeRequest(channelType:string, ...content:Vector<any>):Promise<any>;
}
