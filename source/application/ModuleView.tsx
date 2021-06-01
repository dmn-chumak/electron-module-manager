import * as React from 'react';
import { BridgeRequestType } from './BridgeRequestType';
import { BridgeWrapper } from './BridgeWrapper';
import { ModuleOptions } from './ModuleOptions';

export class ModuleView<ModuleType extends number, ModuleState = any, ModuleContext = any> extends React.PureComponent<ModuleOptions<ModuleType, ModuleState>, ModuleState> {
    protected readonly _context:ModuleContext;

    public constructor(props:ModuleOptions<ModuleType, ModuleState>) {
        super(props);

        this._context = BridgeWrapper.createModuleContext();
        this.state = {
            ...props.initialState
        };
    }

    private internal_moduleStateUpdateHandler = (state:Readonly<ModuleState>):void => {
        this.componentStateUpdate(state);
    };

    public componentStateUpdate(state:Readonly<ModuleState>):void {
        this.setState(state);
    }

    public componentDidMount():void {
        BridgeWrapper.appendHandler(BridgeRequestType.INCOMING_UPDATE_MODULE_STATE, this.internal_moduleStateUpdateHandler);
    }

    public componentWillUnmount():void {
        BridgeWrapper.removeHandler(BridgeRequestType.INCOMING_UPDATE_MODULE_STATE, this.internal_moduleStateUpdateHandler);
    }

    public render():React.ReactNode {
        return (
            <div className="module" />
        );
    }
}
