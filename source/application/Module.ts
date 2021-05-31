import { Application } from './Application';
import { ModuleWindow } from './ModuleWindow';
import { WindowBaseOptions } from './WindowBaseOptions';

export abstract class Module<ModuleType extends number, ModuleState = any> {
    protected _window:ModuleWindow<ModuleState>;
    protected readonly _application:Application<ModuleType>;
    protected _state:ModuleState;

    public constructor(application:Application<ModuleType>, state:Readonly<ModuleState> = null) {
        this._window = null;
        this._application = application;
        this._state = { ...state };
    }

    public async compose(window:ModuleWindow<ModuleState>):Promise<void> {
        this._window = window;
    }

    public async dispose():Promise<void> {
        this._window = null;
    }

    public updateState(state:Partial<ModuleState>, notifyView:boolean = true):void {
        this._state = { ...this._state, ...state };

        if (this._window != null && notifyView) {
            this._window.notifyModuleView(this._state);
        }
    }

    public notifyState():void {
        if (this._window != null) {
            this._window.notifyModuleView(this._state);
        }
    }

    public get windowOptions():Readonly<Partial<WindowBaseOptions>> {
        return null;
    }

    public get state():Readonly<ModuleState> {
        return this._state;
    }
}
