import * as React from 'react';
import { Class } from '../Class';
import { Dictionary } from '../Dictionary';
import { ModuleView } from '../modules/ModuleView';
import { PluginView } from '../plugins/PluginView';
import { WindowOptions } from './WindowOptions';

export interface WindowProps<ModuleState = any> extends WindowOptions<ModuleState> {
    moduleViewMap?:Dictionary<Class<typeof ModuleView>>;
    pluginViewMap?:Dictionary<Class<typeof PluginView>>;
}

export class WindowView<ModuleState = any> extends React.PureComponent<WindowProps<ModuleState>> {
    public override render():React.ReactNode {
        const { moduleInitialState, moduleType, channelIndex } = this.props;
        const { moduleViewMap, pluginViewMap } = this.props;

        if (moduleViewMap != null) {
            const moduleView = moduleViewMap[moduleType];

            if (moduleView != null) {
                return React.createElement(
                    moduleView, {
                        initialState: moduleInitialState,
                        pluginViewMap,
                        moduleType,
                        channelIndex
                    }
                );
            }
        }

        return null;
    }
}
