import { ModuleView } from 'electron-module-manager';
import * as React from 'react';
import { ModuleType } from '../ModuleType';
import { CounterModuleContext } from './CounterModuleContext';
import { CounterModuleState } from './CounterModuleState';

export class CounterModuleView extends ModuleView<ModuleType, CounterModuleState, CounterModuleContext> {
    private _updatesCount:number = 0;

    private increaseCounterValue = async () => {
        this._updatesCount++;

        await this._context.increaseValue();
    };

    public componentDidMount() {
        setInterval(this.increaseCounterValue, 1000);
    }

    public render():React.ReactNode {
        return (
            <div className="counter">
                <div>Current window <strong>counter</strong>: { this._updatesCount }</div>
                <div>Global <strong>counter</strong>: { this.state.counter }</div>
            </div>
        );
    }
}
