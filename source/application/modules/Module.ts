import { Application } from '../Application';
import { BridgeContextEntity } from '../bridge/BridgeContextEntity';
import { Window } from '../windows/Window';
import { WindowBaseOptions } from '../windows/WindowBaseOptions';

export abstract class Module<ModuleState = any> extends BridgeContextEntity<ModuleState> {
    protected readonly _application:Application;
    protected _activeWindow:Window<ModuleState>;
    protected readonly _moduleType:string;

    public constructor(application:Application, moduleType:string, state:ModuleState = null) {
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
        this._state = null;
    }

    public override updateViewState(state:Partial<Readonly<ModuleState>>):void {
        if (this._activeWindow != null) {
            this._activeWindow.updateModuleState(
                this._moduleType, state
            );
        }
    }

    public override updateView():void {
        if (this._activeWindow != null) {
            const updatePatch = this.generateUpdatePatch();

            this._activeWindow.updateModuleWithPatch(
                this._moduleType, updatePatch
            );
        }
    }

    public get windowOptions():Partial<WindowBaseOptions> {
        return null;
    }

    public get moduleType():string {
        return this._moduleType;
    }

    public get activeWindow():Window<ModuleState> {
        return this._activeWindow;
    }

    public get state():ModuleState {
        return this._state;
    }
}
