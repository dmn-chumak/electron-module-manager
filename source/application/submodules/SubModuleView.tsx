import * as React from 'react';
import { BridgeRequestType } from '../BridgeRequestType';
import { BridgeWrapper } from '../BridgeWrapper';
import { ModuleOptions } from '../ModuleOptions';
import { SubModuleBridgeWrapper } from './SubModuleBridgeWrapper';

export class SubModuleView<ModuleType extends number, ModuleState = any, ModuleContext = any> extends React.PureComponent<ModuleOptions<ModuleType, ModuleState>, ModuleState> {
    protected readonly _context:ModuleContext;

    public constructor(props:ModuleOptions<ModuleType, ModuleState>) {
        super(props);

        this._context = SubModuleBridgeWrapper.createModuleContext(props.moduleType);
        this.state = {
            ...props.initialState
        };
    }

    private internal_moduleStateUpdateHandler = (moduleType:ModuleType, state:Readonly<ModuleState>):void => {
        if (this.props.moduleType === moduleType) {
            this.componentStateUpdate(state);
        }
    };

    public componentStateUpdate(state:Readonly<ModuleState>):void {
        this.setState(state);
    }

    public componentDidMount():void {
        BridgeWrapper.context.appendHandler(BridgeRequestType.INCOMING_UPDATE_SUB_MODULE_STATE, this.internal_moduleStateUpdateHandler);
    }

    public componentWillUnmount():void {
        BridgeWrapper.context.removeHandler(BridgeRequestType.INCOMING_UPDATE_SUB_MODULE_STATE, this.internal_moduleStateUpdateHandler);
    }

    public render():React.ReactNode {
        return (
            <div className="module" />
        );
    }
}
