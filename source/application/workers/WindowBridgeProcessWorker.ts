import { DEFAULT_BRIDGE_CONTEXT } from '../BridgeContextDefault';
import { DEFAULT_BRIDGE_CONTEXT_PATH } from '../BridgeContextDefaultPath';
import { Electron } from '../ElectronResolver';

export class WindowBridgeProcessWorker {
    public static createBridge():void {
        Electron.contextBridge.exposeInMainWorld(
            DEFAULT_BRIDGE_CONTEXT_PATH,
            DEFAULT_BRIDGE_CONTEXT
        );
    }
}
