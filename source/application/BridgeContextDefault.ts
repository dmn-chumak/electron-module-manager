import * as Electron from 'electron';
import { BridgeContext } from './BridgeContext';
import { BridgeRequestType } from './BridgeRequestType';
import { Vector } from './typedefs/Vector';

export const DEFAULT_BRIDGE_CONTEXT:BridgeContext = {
    handle: async (requestType:BridgeRequestType, handler:(content:any) => void):Promise<void> => {
        Electron.ipcRenderer.on(
            requestType, (event, content:any) => {
                handler(content);
            }
        );
    },
    invoke: async (moduleType:any, action:string, ...content:Vector<any>):Promise<any> => {
        return await Electron.ipcRenderer.invoke(
            BridgeRequestType.PROCESS_MODULE_REQUEST,
            moduleType, action, ...content
        );
    }
};
