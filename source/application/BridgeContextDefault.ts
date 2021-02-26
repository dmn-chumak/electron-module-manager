import * as Electron from 'electron';
import { BridgeContext } from './BridgeContext';
import { BridgeEventHandler } from './BridgeEventHandler';
import { BridgeRequestType } from './BridgeRequestType';
import { Vector } from './typedefs/Vector';

export const DEFAULT_BRIDGE_CONTEXT:BridgeContext = {
    async appendHandler<ContentType>(requestType:string | BridgeRequestType, handler:BridgeEventHandler<ContentType>):Promise<void> {
        Electron.ipcRenderer.on(
            requestType, handler.nativeFunc = (event:Electron.IpcRendererEvent, content:any) => {
                handler(content);
            }
        );
    },

    async appendHandlerOnce<ContentType>(requestType:string | BridgeRequestType, handler:BridgeEventHandler<ContentType>):Promise<void> {
        Electron.ipcRenderer.once(
            requestType, handler.nativeFunc = (event:Electron.IpcRendererEvent, content:any) => {
                handler(content);
            }
        );
    },

    async removeHandler<ContentType>(requestType:string | BridgeRequestType, handler:BridgeEventHandler<ContentType>):Promise<void> {
        if (handler == null) {
            Electron.ipcRenderer.removeAllListeners(requestType);
        } else {
            Electron.ipcRenderer.removeListener(
                requestType, handler.nativeFunc
            );
        }
    },

    async invoke<ModuleType>(action:string, ...content:Vector<any>):Promise<any> {
        return await Electron.ipcRenderer.invoke(
            BridgeRequestType.PROCESS_MODULE_REQUEST,
            action, ...content
        );
    }
};
