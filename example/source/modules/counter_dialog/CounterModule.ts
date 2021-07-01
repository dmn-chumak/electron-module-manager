import { WindowBaseOptions } from 'electron-module-manager';
import { Module } from 'electron-module-manager';
import { ModuleType } from '../ModuleType';
import { WorkspaceModuleState } from '../workspace/WorkspaceModuleState';
import { CounterModuleState } from './CounterModuleState';
import { CounterModuleView } from './CounterModuleView';

export class CounterModule extends Module<CounterModuleState, CounterModuleView> {
    public async increaseValue():Promise<void> {
        const currentState = this._application.windowManager.obtainState<WorkspaceModuleState>(ModuleType.WORKSPACE);
        const counter = currentState.counter + 1;

        this._application.windowManager.updateState(ModuleType.WORKSPACE, { counter });
        this._application.windowManager.updateState(ModuleType.COUNTER, { counter });
    }

    public get windowOptions():WindowBaseOptions {
        return {
            moduleTitle: 'Counter',
            allowMultipleInstances: true,
            attachParent: true,
            isModal: false,
            isResizable: false,
            width: 250,
            height: 250
        };
    }
}
