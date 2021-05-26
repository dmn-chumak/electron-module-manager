import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BridgeRequestType } from '../BridgeRequestType';
import { BridgeWrapper } from '../BridgeWrapper';
import { Class } from '../declarations/Class';
import { Dictionary } from '../declarations/Dictionary';
import { ModuleView } from '../ModuleView';
import { WindowOptions } from '../WindowOptions';
import { WindowView } from '../WindowView';

export class WindowProcessWorker {
    public static createWindow<ModuleType extends number, ModuleState = any>(windowView:Class<WindowView<ModuleType, ModuleState>>, elementSelector:string, moduleViewMap:Dictionary<Class<ModuleView<ModuleType>>> = null):void {
        BridgeWrapper.context.appendHandlerOnce(
            BridgeRequestType.INCOMING_INITIALIZE_WINDOW_STATE,
            (options:WindowOptions<ModuleType, ModuleState>):void => {
                const container = document.querySelector(elementSelector);
                document.title = options.moduleTitle;

                ReactDOM.render(
                    React.createElement(windowView, { ...options, moduleViewMap }),
                    container
                );
            }
        );
    }
}
