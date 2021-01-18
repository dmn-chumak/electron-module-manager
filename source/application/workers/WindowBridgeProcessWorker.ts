import * as Electron from 'electron';
import { DEFAULT_BRIDGE_CONTEXT } from '../BridgeContextDefault';
import { DEFAULT_BRIDGE_CONTEXT_PATH } from '../BridgeContextDefaultPath';

export class WindowBridgeProcessWorker {
    public static createBridge():void {
        Electron.contextBridge.exposeInMainWorld(
            DEFAULT_BRIDGE_CONTEXT_PATH,
            DEFAULT_BRIDGE_CONTEXT
        );
    }
}
