import { BridgeContext } from './BridgeContext';
import { DEFAULT_BRIDGE_CONTEXT_PATH } from './BridgeContextDefaultPath';
import { Vector } from './typedefs/Vector';

export class BridgeWrapper {
    public static createModuleContext<ModuleContext>(bridgeContext:BridgeContext = null):ModuleContext {
        bridgeContext = (bridgeContext || BridgeWrapper.context);

        return new Proxy(window, {
            get(target:any, action:string):any {
                return async (...content:Vector<any>):Promise<any> => {
                    return await bridgeContext.invoke(
                        action, ...content
                    );
                };
            }
        });
    }

    public static get context():BridgeContext {
        return BridgeWrapper.wrapper[DEFAULT_BRIDGE_CONTEXT_PATH];
    }

    public static get wrapper():any {
        return window;
    }
}
