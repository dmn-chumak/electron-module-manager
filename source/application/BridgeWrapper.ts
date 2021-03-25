import { BridgeContext } from './BridgeContext';
import { DEFAULT_BRIDGE_CONTEXT_PATH } from './BridgeContextDefaultPath';
import { BridgeRequestType } from './BridgeRequestType';
import { ModuleOptions } from './ModuleOptions';
import { Vector } from './typedefs/Vector';

export class BridgeWrapper implements ProxyHandler<any> {
    private readonly _invokeRequestType:string | BridgeRequestType;
    private readonly _bridgeContext:BridgeContext;

    public constructor(bridgeContext:BridgeContext) {
        this._invokeRequestType = BridgeRequestType.PROCESS_MODULE_REQUEST;
        this._bridgeContext = bridgeContext;
    }

    public static createModuleContext<ModuleContext>(bridgeContext:BridgeContext = null):ModuleContext {
        return new Proxy(window, new BridgeWrapper(
            bridgeContext || BridgeWrapper.context
        ));
    }

    public static async createSubModule<ModuleType extends number, ModuleState = any>(moduleType:ModuleType, moduleState:ModuleState = null):Promise<ModuleOptions<ModuleType, ModuleState>> {
        return await BridgeWrapper.context.invoke(BridgeRequestType.CREATE_SUB_MODULE, moduleType, moduleState);
    }

    public static async removeSubModule<ModuleType extends number, ModuleState = any>(moduleType:ModuleType):Promise<void> {
        await BridgeWrapper.context.invoke(BridgeRequestType.REMOVE_SUB_MODULE, moduleType);
    }

    public get(target:any, action:string):any {
        return async (...content:Vector<any>):Promise<any> => {
            return await this._bridgeContext.invoke(
                this._invokeRequestType, action, ...content
            );
        };
    }

    public static get context():BridgeContext {
        return BridgeWrapper.wrapper[DEFAULT_BRIDGE_CONTEXT_PATH];
    }

    public static get wrapper():any {
        return window;
    }
}
