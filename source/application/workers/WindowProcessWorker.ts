import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BridgeRequestType } from '../BridgeRequestType';
import { BridgeWrapper } from '../BridgeWrapper';
import { ModuleView } from '../ModuleView';
import { Class } from '../typedefs/Class';
import { Dictionary } from '../typedefs/Dictionary';
import { WindowOptions } from '../WindowOptions';
import { WindowView } from '../WindowView';

export class WindowProcessWorker {
    public static createWindow<ModuleType extends number, ModuleState = any>(windowView:Class<WindowView<ModuleType, ModuleState>>, elementSelector:string, moduleViewMap:Dictionary<Class<ModuleView<ModuleType>>> = null):void {
        BridgeWrapper.context.appendHandlerOnce(
            BridgeRequestType.INITIALIZE_WINDOW_STATE,
            (options:WindowOptions<ModuleType, ModuleState>):void => {
                const container = document.querySelector(elementSelector);
                document.title = options.moduleTitle;

                if (moduleViewMap != null) {
                    options.moduleViewMap = moduleViewMap;
                }

                ReactDOM.render(
                    React.createElement(windowView, options),
                    container
                );
            }
        );
    }
}
