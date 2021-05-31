import { BridgeContext } from '../BridgeContext';
import { BridgeRequestType } from '../BridgeRequestType';
import { BridgeWrapper } from '../BridgeWrapper';
import { Vector } from '../declarations/Vector';

export class SubModuleBridgeWrapper<ModuleType extends number> extends BridgeWrapper {
    protected readonly _moduleType:ModuleType;

    public constructor(moduleType:ModuleType, bridgeContext:BridgeContext) {
        super(bridgeContext);

        this._moduleType = moduleType;
    }

    public static createSubModuleContext<ModuleType extends number, ModuleContext>(moduleType:ModuleType, bridgeContext:BridgeContext = null):ModuleContext {
        return new Proxy(window, new SubModuleBridgeWrapper(moduleType, (bridgeContext != null) ? bridgeContext : BridgeWrapper.context));
    }

    protected async invokeRequest(action:string, ...content:Vector<any>):Promise<any> {
        return await this._bridgeContext.invoke(
            BridgeRequestType.OUTGOING_PROCESS_SUB_MODULE_REQUEST,
            this._moduleType, action, ...content
        );
    }
}
