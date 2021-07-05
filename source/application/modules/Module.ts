import { Application } from '../Application';
import { BridgeContextEntity } from '../bridge/BridgeContextEntity';
import { Window } from '../windows/Window';
import { WindowBaseOptions } from '../windows/WindowBaseOptions';

export abstract class Module<ModuleState = any> extends BridgeContextEntity<ModuleState> {
    protected readonly _application:Application;
    protected _activeWindow:Window<ModuleState>;
    protected readonly _moduleType:number;

    public constructor(application:Application, moduleType:number, state:ModuleState = null) {
        super();

        this._application = application;
        this._activeWindow = null;
        this._moduleType = moduleType;

        this._state = state;
    }

    public composeWindow(window:Window<ModuleState>):void {
        this._activeWindow = window;
    }

    public disposeWindow():void {
        this._activeWindow = null;
    }

    public updateState(state:Partial<Readonly<ModuleState>>):void {
        for (const property in state) {
            if (state.hasOwnProperty(property)) {
                this._state[property] = state[property];
            }
        }

        this.notifyView();
    }

    public notifyView():void {
        if (this._activeWindow != null) {
            const updatePatch = this.createUpdatePatch();

            this._activeWindow.updateModuleState(
                this._moduleType, updatePatch
            );
        }
    }

    public get windowOptions():Partial<WindowBaseOptions> {
        return null;
    }

    public get moduleType():number {
        return this._moduleType;
    }

    public get activeWindow():Window<ModuleState> {
        return this._activeWindow;
    }

    public get state():Readonly<ModuleState> {
        return this._state;
    }
}
