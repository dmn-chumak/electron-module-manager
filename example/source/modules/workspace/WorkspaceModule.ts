import { WindowBaseOptions } from 'electron-module-manager';
import { Module } from 'electron-module-manager';
import { CounterModuleState } from '../counter_dialog/CounterModuleState';
import { ModuleType } from '../ModuleType';
import { WorkspaceModuleState } from './WorkspaceModuleState';
import { WorkspaceModuleView } from './WorkspaceModuleView';

export class WorkspaceModule extends Module<WorkspaceModuleState, WorkspaceModuleView> {
    public async createCounterDialog():Promise<void> {
        await this._application.windowManager.create<CounterModuleState>(ModuleType.COUNTER, { counter: this._state.counter });
    }

    public async closeAllDialogs():Promise<void> {
        await this._application.windowManager.close(ModuleType.COUNTER);
    }

    public get windowOptions():WindowBaseOptions {
        return {
            moduleTitle: 'Workspace',
            isResizable: false,
            isModal: false,
            isCentered: true,
            width: 350,
            height: 350
        };
    }
}
