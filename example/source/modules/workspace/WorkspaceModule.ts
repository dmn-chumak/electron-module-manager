import { WindowOptions } from 'electron-module-manager';
import { Module } from 'electron-module-manager';
import { ModuleType } from '../ModuleType';
import { WorkspaceModuleContext } from './WorkspaceModuleContext';
import { WorkspaceModuleState } from './WorkspaceModuleState';

export class WorkspaceModule extends Module<ModuleType, WorkspaceModuleState> implements WorkspaceModuleContext {
    public constructor() {
        super(ModuleType.WORKSPACE);

        this._state = {
            counter: 0
        };
    }

    public async createCounterDialog():Promise<void> {
        await this._application.createWindow(ModuleType.COUNTER);
    }

    public async closeAllDialogs():Promise<void> {
        await this._application.closeWindow(ModuleType.COUNTER);
    }

    public get windowOptions():Partial<WindowOptions<ModuleType>> {
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
