import * as ElectronTypes from 'electron';
import { BridgeContext } from './BridgeContext';
import { BridgeEventHandler } from './BridgeEventHandler';
import { BridgeRequestType } from './BridgeRequestType';
import { Vector } from './declarations/Vector';
import { Electron } from './ElectronResolver';

export const DEFAULT_BRIDGE_CONTEXT:BridgeContext = {
    async appendHandler(requestType:string | BridgeRequestType, handler:BridgeEventHandler):Promise<void> {
        Electron.ipcRenderer.on(
            requestType, handler.nativeFunc = (event:ElectronTypes.IpcRendererEvent, ...content:Vector<any>) => {
                handler(...content);
            }
        );
    },

    async appendHandlerOnce(requestType:string | BridgeRequestType, handler:BridgeEventHandler):Promise<void> {
        Electron.ipcRenderer.once(
            requestType, handler.nativeFunc = (event:ElectronTypes.IpcRendererEvent, ...content:Vector<any>) => {
                handler(...content);
            }
        );
    },

    async removeHandler(requestType:string | BridgeRequestType, handler:BridgeEventHandler):Promise<void> {
        if (handler == null || handler.nativeFunc == null) {
            Electron.ipcRenderer.removeAllListeners(requestType);
        } else {
            Electron.ipcRenderer.removeListener(
                requestType, handler.nativeFunc
            );
        }
    },

    async invoke<ModuleType>(requestType:string | BridgeRequestType, action:string, ...content:Vector<any>):Promise<any> {
        return await Electron.ipcRenderer.invoke(
            requestType, action, ...content
        );
    }
};
