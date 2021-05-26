import * as Electron from 'electron';
import { Module } from '../Module';
import { ModuleWindow } from '../ModuleWindow';
import { Window } from '../Window';

export class SubModuleWindow<ModuleType extends number, ModuleState = any> implements ModuleWindow<ModuleState> {
    protected readonly _parentWindow:Window<ModuleType>;
    protected readonly _module:Module<ModuleType, ModuleState>;
    protected readonly _moduleType:ModuleType;

    public constructor(parentWindow:Window<ModuleType>, moduleType:ModuleType, module:Module<ModuleType, ModuleState>) {
        this._parentWindow = parentWindow;
        this._module = module;
        this._moduleType = moduleType;
    }

    public async compose():Promise<void> {
        await this._module.compose(this);
    }

    public notifyModuleView(state:Partial<ModuleState>):void {
        this._parentWindow.notifySubModuleView(this._moduleType, state);
    }

    public closeDevTools():void {
        this._parentWindow.closeDevTools();
    }

    public restoreDevTools():void {
        this._parentWindow.restoreDevTools();
    }

    public close():void {
        this._parentWindow.close();
    }

    public restore():void {
        this._parentWindow.restore();
    }

    public get nativeWindow():Electron.BrowserWindow {
        return this._parentWindow.nativeWindow;
    }

    public get module():Module<ModuleType, ModuleState> {
        return this._module;
    }

    public get moduleType():ModuleType {
        return this._moduleType;
    }

    public get isActive():boolean {
        return this._parentWindow.isActive;
    }
}
