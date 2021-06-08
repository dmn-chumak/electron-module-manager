import { Application } from './Application';
import { ModuleWindow } from './ModuleWindow';
import { WindowBaseOptions } from './WindowBaseOptions';

export abstract class Module<ModuleType extends number, ModuleState = any> {
    protected _window:ModuleWindow<ModuleState>;
    protected readonly _application:Application<ModuleType>;
    protected _state:ModuleState;

    public constructor(application:Application<ModuleType>, state:ModuleState = null) {
        this._window = null;
        this._application = application;
        this._state = state;
    }

    public async compose(window:ModuleWindow<ModuleState>):Promise<void> {
        this._window = window;
    }

    public async dispose():Promise<void> {
        this._window = null;
    }

    public updateState(state:Partial<ModuleState>, notifyView:boolean = true):void {
        for (const property in state) {
            if (state.hasOwnProperty(property)) {
                this._state[property] = state[property];
            }
        }

        if (notifyView) {
            this.notifyState(state);
        }
    }

    public notifyState(state:Partial<ModuleState>):void {
        if (this._window != null) {
            this._window.notifyModuleView(state);
        }
    }

    public get windowOptions():Readonly<Partial<WindowBaseOptions>> {
        return null;
    }

    public get state():Readonly<ModuleState> {
        return this._state;
    }
}
