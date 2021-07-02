import * as Electron from 'electron';
import { Vector } from '../Vector';
import { BridgeRequestType } from './BridgeRequestType';

export class BridgeContextViewWrapper implements ProxyHandler<any> {
    protected readonly _webContents:Electron.WebContents;
    protected readonly _entityType:number;
    protected readonly _requestType:string;

    public constructor(webContents:Electron.WebContents, requestType:string, entityType:number) {
        this._webContents = webContents;
        this._entityType = entityType;
        this._requestType = requestType;
    }

    public static createModuleViewContext<ContextType>(webContents:Electron.WebContents, moduleType:number):ContextType {
        return new Proxy(
            Object.create(null), new BridgeContextViewWrapper(
                webContents,
                BridgeRequestType.PROCESS_MODULE_VIEW_REQUEST,
                moduleType
            )
        );
    }

    public static createDummyContext<ContextType>():ContextType {
        return new Proxy(
            Object.create(null), new BridgeContextViewWrapper(
                null, null, -1
            )
        );
    }

    public static createPluginViewContext<ContextType>(webContents:Electron.WebContents, pluginType:number):ContextType {
        return new Proxy(
            Object.create(null), new BridgeContextViewWrapper(
                webContents,
                BridgeRequestType.PROCESS_PLUGIN_VIEW_REQUEST,
                pluginType
            )
        );
    }

    public get(target:any, action:string):any {
        return (...content:Vector<any>) => {
            if (this._webContents != null) {
                this._webContents.send(
                    this._requestType, this._entityType, action, ...content
                );
            }
        };
    }
}
