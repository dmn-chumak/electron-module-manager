import { Vector } from '../Vector';

export class BridgeRemoteCallsHelper {
    public static execute(handler:any, action:string, content:Vector<any>):any {
        if (action !== 'constructor' && typeof (handler[action]) === 'function') {
            return handler[action](...content);
        }

        return null;
    }
}
