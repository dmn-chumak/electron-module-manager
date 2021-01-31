import { Module } from 'electron-module-manager';
import { WindowOptions } from '../../../../source';
import { ModuleType } from '../ModuleType';
import { WorkspaceModuleState } from '../workspace/WorkspaceModuleState';
import { CounterModuleContext } from './CounterModuleContext';
import { CounterModuleState } from './CounterModuleState';

export class CounterModule extends Module<ModuleType, CounterModuleState> implements CounterModuleContext {
    public constructor() {
        super(ModuleType.COUNTER);

        this._state = {
            counter: 0
        };
    }

    public async increaseValue():Promise<void> {
        const currentState = this._application.obtainState<WorkspaceModuleState>(ModuleType.WORKSPACE);
        const counter = currentState.counter + 1;

        this._application.updateState(ModuleType.WORKSPACE, { counter }, true);
        this._application.updateState(this._moduleType, { counter }, true);
    }

    public get windowOptions():Partial<WindowOptions<ModuleType>> {
        return {
            moduleTitle: 'Counter',
            allowMultipleInstances: true,
            isModal: true,
            isResizable: false,
            width: 250,
            height: 250
        };
    }
}
