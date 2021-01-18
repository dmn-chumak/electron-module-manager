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
    public static createWindow<ModuleType>(windowView:Class<WindowView<ModuleType>>, element:string, moduleViewMap:Dictionary<Class<ModuleView<ModuleType>>> = null):void {
        BridgeWrapper.context.handle(
            BridgeRequestType.INITIALIZE_WINDOW_STATE,
            (options:WindowOptions<ModuleType>):void => {
                const wrapper = document.querySelector('#application');

                if (moduleViewMap != null) {
                    options.moduleViewMap = moduleViewMap;
                }

                ReactDOM.render(
                    React.createElement(windowView, options),
                    wrapper
                );
            }
        );
    }
}
