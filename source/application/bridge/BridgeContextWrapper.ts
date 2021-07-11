import { Vector } from '../Vector';
import { BridgeContext } from './BridgeContext';
import { DEFAULT_BRIDGE_CONTEXT_PATH } from './BridgeContextDefaultPath';
import { BridgeRequestType } from './BridgeRequestType';

export class BridgeContextWrapper implements ProxyHandler<any> {
    protected readonly _bridgeContext:BridgeContext;
    protected readonly _targetEntityType:string;
    protected readonly _channelType:string;

    public constructor(bridgeContext:BridgeContext, channelType:string, targetEntityType:string) {
        this._bridgeContext = bridgeContext;
        this._targetEntityType = targetEntityType;
        this._channelType = channelType;
    }

    public static appendEventListener(requestType:string, handler:any):void {
        handler.nativeIndex = BridgeContextWrapper.context.appendEventListener(requestType, handler);
    }

    public static appendEventListenerOnce(requestType:string, handler:any):void {
        handler.nativeIndex = BridgeContextWrapper.context.appendEventListenerOnce(requestType, handler);
    }

    public static removeEventListener(requestType:string, handler:any):void {
        BridgeContextWrapper.context.removeEventListener(requestType, handler.nativeIndex);
    }

    public static createModuleContext<ContextType>(channelIndex:number, moduleType:string):ContextType {
        return new Proxy(
            Object.create(null), new BridgeContextWrapper(
                BridgeContextWrapper.context,
                BridgeRequestType.PROCESS_MODULE_REQUEST + '_' + channelIndex,
                moduleType
            )
        );
    }

    public static createPluginContext<ContextType>(channelIndex:number, pluginType:string):ContextType {
        return new Proxy(
            Object.create(null), new BridgeContextWrapper(
                BridgeContextWrapper.context,
                BridgeRequestType.PROCESS_PLUGIN_REQUEST + '_' + channelIndex,
                pluginType
            )
        );
    }

    public get(target:any, action:string):any {
        return (...content:Vector<any>) => {
            return this._bridgeContext.invokeRequest(
                this._channelType, this._targetEntityType,
                action, ...content
            );
        };
    }

    public static get context():BridgeContext {
        return BridgeContextWrapper.wrapper[DEFAULT_BRIDGE_CONTEXT_PATH];
    }

    public static get wrapper():any {
        return window;
    }
}
