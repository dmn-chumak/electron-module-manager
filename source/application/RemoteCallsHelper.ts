import { Vector } from './declarations/Vector';

export class RemoteCallsHelper {
    public static async execute(handler:any, action:string, ...content:Vector<any>):Promise<any> {
        if (action !== 'constructor' && typeof (handler[action]) === 'function') {
            return await handler[action](...content);
        }

        return null;
    }
}
