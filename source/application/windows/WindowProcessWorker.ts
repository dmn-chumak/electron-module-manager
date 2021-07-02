import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BridgeContextWrapper } from '../bridge/BridgeContextWrapper';
import { BridgeRequestType } from '../bridge/BridgeRequestType';
import { Class } from '../Class';
import { Dictionary } from '../Dictionary';
import { ModuleView } from '../modules/ModuleView';
import { PluginView } from '../plugins/PluginView';
import { WindowOptions } from './WindowOptions';
import { WindowView } from './WindowView';

export class WindowProcessWorker {
    public static createWindow<ModuleState = any>(windowView:Class<typeof WindowView>, elementSelector:string, moduleViewMap:Dictionary<Class<typeof ModuleView>> = null, pluginViewMap:Dictionary<Class<typeof PluginView>> = null):void {
        BridgeContextWrapper.appendEventListenerOnce(
            BridgeRequestType.INITIALIZE_MODULE_WINDOW,
            (options:WindowOptions<ModuleState>):void => {
                const container = document.querySelector(elementSelector);
                document.title = options.moduleTitle;

                ReactDOM.render(
                    React.createElement(
                        windowView, {
                            ...options, moduleViewMap,
                            pluginViewMap
                        }
                    ),
                    container
                );
            }
        );
    }
}
