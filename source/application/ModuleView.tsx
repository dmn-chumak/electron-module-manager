import * as React from 'react';
import { BridgeRequestType } from './BridgeRequestType';
import { BridgeWrapper } from './BridgeWrapper';
import { ModuleOptions } from './ModuleOptions';

export class ModuleView<ModuleType extends number, ModuleState = any, ModuleContext = any> extends React.Component<ModuleOptions<ModuleType, ModuleState>, ModuleState> {
    protected readonly _context:ModuleContext;

    public constructor(props:ModuleOptions<ModuleType, ModuleState>) {
        super(props);

        this._context = BridgeWrapper.createModuleContext();
        this.state = {
            ...props.initialState
        };
    }

    private moduleStateUpdateHandler = (state:Readonly<ModuleState>):void => {
        this.setState(state);
    };

    public componentDidMount():void {
        BridgeWrapper.context.appendHandler(BridgeRequestType.UPDATE_MODULE_STATE, this.moduleStateUpdateHandler);
    }

    public componentWillUnmount():void {
        BridgeWrapper.context.removeHandler(BridgeRequestType.UPDATE_MODULE_STATE, this.moduleStateUpdateHandler);
    }

    public render():React.ReactNode {
        return (
            <div className="module" />
        );
    }
}
