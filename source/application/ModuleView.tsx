import * as React from 'react';
import { BridgeRequestType } from './BridgeRequestType';
import { BridgeWrapper } from './BridgeWrapper';
import { ModuleOptions } from './ModuleOptions';

export class ModuleView<ModuleType, ModuleState = any, ModuleContext = any> extends React.Component<ModuleOptions<ModuleType, ModuleState>, ModuleState> {
    protected readonly _context:ModuleContext;

    public constructor(props:ModuleOptions<ModuleType, ModuleState>) {
        super(props);

        this._context = BridgeWrapper.createModuleContext(props.moduleType);
        this.state = {
            ...props.initialState
        };

        BridgeWrapper.context.handle(
            BridgeRequestType.UPDATE_MODULE_STATE,
            (state:ModuleState):void => {
                this.setState(state);
            }
        );
    }

    public render():React.ReactNode {
        return (
            <div className="module" />
        );
    }
}
