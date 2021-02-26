import { Module } from 'electron-module-manager/output/Module';
import { WindowBaseOptions } from 'electron-module-manager/output/WindowBaseOptions';
import { CounterModuleState } from '../counter_dialog/CounterModuleState';
import { ModuleType } from '../ModuleType';
import { WorkspaceModuleContext } from './WorkspaceModuleContext';
import { WorkspaceModuleState } from './WorkspaceModuleState';

export class WorkspaceModule extends Module<ModuleType, WorkspaceModuleState> implements WorkspaceModuleContext {
    public async createCounterDialog():Promise<void> {
        await this._application.createWindow<CounterModuleState>(ModuleType.COUNTER, { counter: this._state.counter });
    }

    public async closeAllDialogs():Promise<void> {
        await this._application.closeWindow(ModuleType.COUNTER);
    }

    public static createWindowOptions():Partial<WindowBaseOptions> {
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