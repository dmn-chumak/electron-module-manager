import * as React from 'react';
import { BridgeRequestType } from './BridgeRequestType';
import { BridgeWrapper } from './BridgeWrapper';
import { ModuleView } from './ModuleView';
import { Class } from './typedefs/Class';
import { WindowOptions } from './WindowOptions';
import { WindowState } from './WindowState';

export class WindowView<ModuleType> extends React.Component<WindowOptions<ModuleType>, WindowState> {
    protected readonly _moduleViewRef:React.RefObject<ModuleView<ModuleType>>;

    public constructor(props:WindowOptions<ModuleType>) {
        super(props);

        this._moduleViewRef = React.createRef();
        this.state = {
            ...props.windowInitialState
        };

        BridgeWrapper.context.handle(
            BridgeRequestType.UPDATE_WINDOW_STATE,
            (state:WindowState):void => {
                this.setState(state);
            }
        );
    }

    public createModuleElement(moduleView:Class<ModuleView<ModuleType>>):React.ReactNode {
        return React.createElement(
            moduleView, {
                moduleType: this.props.moduleType,
                initialState: this.props.moduleInitialState,
                ref: this._moduleViewRef
            }
        );
    }

    public renderModule():React.ReactNode {
        if (this.props.moduleViewMap != null) {
            const moduleView = this.props.moduleViewMap[this.props.moduleType];

            if (moduleView != null) {
                return this.createModuleElement(moduleView);
            }
        }

        return this.createModuleElement(ModuleView);
    }

    public render():React.ReactNode {
        return (
            <div className="window">
                { this.renderModule() }
            </div>
        );
    }
}
