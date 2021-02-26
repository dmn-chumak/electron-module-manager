import * as React from 'react';
import { BridgeRequestType } from './BridgeRequestType';
import { BridgeWrapper } from './BridgeWrapper';
import { ModuleView } from './ModuleView';
import { Class } from './typedefs/Class';
import { WindowOptions } from './WindowOptions';
import { WindowState } from './WindowState';

export class WindowView<ModuleType extends number, ModuleState = any> extends React.Component<WindowOptions<ModuleType, ModuleState>, WindowState> {
    protected readonly _moduleViewRef:React.RefObject<ModuleView<ModuleType, ModuleState>>;

    public constructor(props:WindowOptions<ModuleType, ModuleState>) {
        super(props);

        this._moduleViewRef = React.createRef();
        this.state = {
            ...props.initialState
        };
    }

    private windowStateUpdateHandler = (state:Readonly<WindowState>):void => {
        this.setState(state);
    };

    public componentDidMount():void {
        BridgeWrapper.context.appendHandler(BridgeRequestType.UPDATE_WINDOW_STATE, this.windowStateUpdateHandler);
    }

    public componentWillUnmount():void {
        BridgeWrapper.context.removeHandler(BridgeRequestType.UPDATE_WINDOW_STATE, this.windowStateUpdateHandler);
    }

    public createModuleElement(moduleView:Class<ModuleView<ModuleType, ModuleState>>):React.ReactNode {
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
