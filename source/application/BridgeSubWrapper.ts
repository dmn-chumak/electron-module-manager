import { BridgeContext } from './BridgeContext';
import { BridgeRequestType } from './BridgeRequestType';
import { BridgeWrapper } from './BridgeWrapper';
import { Vector } from './typedefs/Vector';

export class BridgeSubWrapper<ModuleType extends number> implements ProxyHandler<any> {
    private readonly _bridgeContext:BridgeContext;
    private readonly _invokeRequestType:string | BridgeRequestType;
    private readonly _moduleType:ModuleType;

    public constructor(moduleType:ModuleType, bridgeContext:BridgeContext) {
        this._bridgeContext = bridgeContext;
        this._invokeRequestType = BridgeRequestType.PROCESS_SUB_MODULE_REQUEST;
        this._moduleType = moduleType;
    }

    public static createModuleContext<ModuleType extends number, ModuleContext>(moduleType:ModuleType, bridgeContext:BridgeContext = null):ModuleContext {
        return new Proxy(window, new BridgeSubWrapper(
            moduleType, bridgeContext || BridgeWrapper.context
        ));
    }

    public get(target:any, action:string):any {
        return async (...content:Vector<any>):Promise<any> => {
            return await this._bridgeContext.invoke(
                this._invokeRequestType, action, ...content
            );
        };
    }
}
