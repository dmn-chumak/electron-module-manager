import * as Electron from 'electron';
import { BridgeContext } from './BridgeContext';
import { BridgeEventHandler } from './BridgeEventHandler';
import { BridgeRequestType } from './BridgeRequestType';
import { Vector } from './declarations/Vector';

export const DEFAULT_BRIDGE_CONTEXT:BridgeContext = {
    async appendHandler(requestType:string | BridgeRequestType, handler:BridgeEventHandler):Promise<void> {
        Electron.ipcRenderer.on(requestType, handler);
    },

    async appendHandlerOnce(requestType:string | BridgeRequestType, handler:BridgeEventHandler):Promise<void> {
        Electron.ipcRenderer.once(requestType, handler);
    },

    async removeHandler(requestType:string | BridgeRequestType, handler:BridgeEventHandler):Promise<void> {
        if (handler == null) {
            Electron.ipcRenderer.removeAllListeners(requestType);
        } else {
            Electron.ipcRenderer.removeListener(
                requestType, handler
            );
        }
    },

    async invoke(requestType:string | BridgeRequestType, action:string, ...content:Vector<any>):Promise<any> {
        return await Electron.ipcRenderer.invoke(
            requestType, action, ...content
        );
    }
};
