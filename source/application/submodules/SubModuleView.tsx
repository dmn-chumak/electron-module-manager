import * as React from 'react';
import { BridgeRequestType } from '../BridgeRequestType';
import { BridgeWrapper } from '../BridgeWrapper';
import { ModuleOptions } from '../ModuleOptions';
import { SubModuleBridgeWrapper } from './SubModuleBridgeWrapper';

export class SubModuleView<ModuleType extends number, ModuleState = any, ModuleContext = any> extends React.Component<ModuleOptions<ModuleType, ModuleState>, ModuleState> {
    protected readonly _context:ModuleContext;

    public constructor(props:ModuleOptions<ModuleType, ModuleState>) {
        super(props);

        this._context = SubModuleBridgeWrapper.createModuleContext(props.moduleType);
        this.state = {
            ...props.initialState
        };
    }

    private moduleStateUpdateHandler = (moduleType:ModuleType, state:Readonly<ModuleState>):void => {
        if (this.props.moduleType === moduleType) {
            this.setState(state);
        }
    };

    public componentDidMount():void {
        BridgeWrapper.context.appendHandler(BridgeRequestType.UPDATE_SUB_MODULE_STATE, this.moduleStateUpdateHandler);
    }

    public componentWillUnmount():void {
        BridgeWrapper.context.removeHandler(BridgeRequestType.UPDATE_SUB_MODULE_STATE, this.moduleStateUpdateHandler);
    }

    public render():React.ReactNode {
        return (
            <div className="module" />
        );
    }
}
