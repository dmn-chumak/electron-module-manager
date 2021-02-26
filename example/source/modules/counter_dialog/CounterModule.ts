import { Module } from 'electron-module-manager';
import { WindowBaseOptions } from 'electron-module-manager';
import { ModuleType } from '../ModuleType';
import { WorkspaceModuleState } from '../workspace/WorkspaceModuleState';
import { CounterModuleContext } from './CounterModuleContext';
import { CounterModuleState } from './CounterModuleState';

export class CounterModule extends Module<ModuleType, CounterModuleState> implements CounterModuleContext {
    public async increaseValue():Promise<void> {
        const currentState = this._application.obtainModuleState<WorkspaceModuleState>(ModuleType.WORKSPACE);
        const counter = currentState.counter + 1;

        this._application.updateModuleState(ModuleType.WORKSPACE, { counter }, true);
        this._application.updateModuleState(ModuleType.COUNTER, { counter }, true);
    }

    public static createWindowOptions():Partial<WindowBaseOptions> {
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
