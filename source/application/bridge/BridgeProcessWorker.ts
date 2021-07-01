import * as Electron from 'electron';
import { BridgeContextDefault } from './BridgeContextDefault';
import { DEFAULT_BRIDGE_CONTEXT_PATH } from './BridgeContextDefaultPath';

export class BridgeProcessWorker {
    public static createBridge():void {
        const bridgeContext = new BridgeContextDefault();

        Electron.contextBridge.exposeInMainWorld(
            DEFAULT_BRIDGE_CONTEXT_PATH,
            bridgeContext.expose()
        );
    }
}
