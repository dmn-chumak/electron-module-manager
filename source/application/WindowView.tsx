import * as React from 'react';
import { BridgeRequestType } from './BridgeRequestType';
import { BridgeWrapper } from './BridgeWrapper';
import { Class } from './declarations/Class';
import { Dictionary } from './declarations/Dictionary';
import { ModuleView } from './ModuleView';
import { WindowOptions } from './WindowOptions';
import { WindowState } from './WindowState';

export interface WindowProps<ModuleType extends number, ModuleState = any> extends WindowOptions<ModuleType, ModuleState> {
    moduleViewMap?:Dictionary<Class<ModuleView<ModuleType>>>;
}

export class WindowView<ModuleType extends number, ModuleState = any> extends React.PureComponent<WindowProps<ModuleType, ModuleState>, WindowState> {
    protected readonly _moduleViewRef:React.RefObject<ModuleView<ModuleType, ModuleState>>;

    public constructor(props:WindowOptions<ModuleType, ModuleState>) {
        super(props);

        this._moduleViewRef = React.createRef();
        this.state = {
            ...props.initialState
        };
    }

    private internal_windowStateUpdateHandler = (state:Readonly<WindowState>):void => {
        this.componentStateUpdate(state);
    };

    public componentStateUpdate(state:Readonly<WindowState>):void {
        this.setState(state);
    }

    public componentDidMount():void {
        BridgeWrapper.context.appendHandler(BridgeRequestType.INCOMING_UPDATE_WINDOW_STATE, this.internal_windowStateUpdateHandler);
    }

    public componentWillUnmount():void {
        BridgeWrapper.context.removeHandler(BridgeRequestType.INCOMING_UPDATE_WINDOW_STATE, this.internal_windowStateUpdateHandler);
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

        return null;
    }

    public render():React.ReactNode {
        return (
            <div className="window">
                { this.renderModule() }
            </div>
        );
    }
}
