import { ModuleView } from 'electron-module-manager';
import * as React from 'react';
import { CounterModule } from './CounterModule';

export class CounterModuleView extends ModuleView<CounterModule> {
    private _updatesCount:number = 0;

    private increaseCounterValue = async () => {
        this._updatesCount++;

        await this._context.increaseValue();
    };

    public componentDidMount() {
        setInterval(this.increaseCounterValue, 1000);
        super.componentDidMount();
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
