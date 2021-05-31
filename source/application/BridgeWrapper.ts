import { BridgeContext } from './BridgeContext';
import { DEFAULT_BRIDGE_CONTEXT_PATH } from './BridgeContextDefaultPath';
import { BridgeRequestType } from './BridgeRequestType';
import { Vector } from './declarations/Vector';
import { ModuleOptions } from './ModuleOptions';

export class BridgeWrapper implements ProxyHandler<any> {
    protected readonly _bridgeContext:BridgeContext;

    public constructor(bridgeContext:BridgeContext) {
        this._bridgeContext = bridgeContext;
    }

    public static createModuleContext<ModuleContext>(bridgeContext:BridgeContext = null):ModuleContext {
        return new Proxy(window, new BridgeWrapper((bridgeContext != null) ? bridgeContext : BridgeWrapper.context));
    }

    public static async createSubModule<ModuleType extends number, ModuleState = any>(moduleType:ModuleType, moduleState:Readonly<Partial<ModuleState>> = null):Promise<ModuleOptions<ModuleType, ModuleState>> {
        return await BridgeWrapper.context.invoke(BridgeRequestType.OUTGOING_CREATE_SUB_MODULE, moduleType, moduleState);
    }

    public static async removeSubModule<ModuleType extends number>(moduleType:ModuleType):Promise<void> {
        await BridgeWrapper.context.invoke(BridgeRequestType.OUTGOING_REMOVE_SUB_MODULE, moduleType);
    }

    protected async invokeRequest(action:string, ...content:Vector<any>):Promise<any> {
        return await this._bridgeContext.invoke(
            BridgeRequestType.OUTGOING_PROCESS_MODULE_REQUEST,
            action, ...content
        );
    }

    public get(target:any, action:string):any {
        return this.invokeRequest.bind(this, action);
    }

    public static get context():BridgeContext {
        return BridgeWrapper.wrapper[DEFAULT_BRIDGE_CONTEXT_PATH];
    }

    public static get wrapper():any {
        return window;
    }
}
