import { ModuleView } from 'electron-module-manager';
import * as React from 'react';
import { ModuleType } from '../ModuleType';
import { WorkspaceModuleContext } from './WorkspaceModuleContext';
import { WorkspaceModuleState } from './WorkspaceModuleState';

export class WorkspaceModuleView extends ModuleView<ModuleType, WorkspaceModuleState, WorkspaceModuleContext> {
    private addClickHandler = async () => {
        await this._context.createCounterDialog();
    };

    private closeClickHandler = async () => {
        await this._context.closeAllDialogs();
    };

    public render():React.ReactNode {
        return (
            <div className="workspace">
                <div className="counter-value">
                    { this.state.counter }
                </div>

                <div className="action">
                    <button onClick={ this.addClickHandler }>Add counter</button>
                </div>

                <div className="action">
                    <button onClick={ this.closeClickHandler }>Remove all counters</button>
                </div>
            </div>
        );
    }
}
