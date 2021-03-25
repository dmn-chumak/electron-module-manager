import { Application } from './Application';
import { Vector } from './typedefs/Vector';
import { Window } from './Window';
import { WindowBaseOptions } from './WindowBaseOptions';

export abstract class Module<ModuleType extends number, ModuleState = any> {
    protected static readonly FORBIDDEN_METHODS_LIST:Vector<string> = [
        'constructor', 'compose', 'process', 'dispose', 'updateState'
    ];

    protected readonly _window:Window<ModuleType, ModuleState>;
    protected readonly _application:Application<ModuleType>;
    protected _state:ModuleState;

    public constructor(application:Application<ModuleType>, window:Window<ModuleType, ModuleState>, state:Readonly<ModuleState> = null) {
        this._window = window;
        this._application = application;
        this._state = { ...state };
    }

    public static createWindowOptions():Partial<WindowBaseOptions> {
        return null;
    }

    public async compose():Promise<void> {
        // empty..
    }

    public async process(sender:any /* Electron.WebContents */, action:string, ...content:Vector<any>):Promise<any> {
        const handler = this as any;

        //-----------------------------------

        if (Module.FORBIDDEN_METHODS_LIST.indexOf(action) === -1 && typeof (handler[action]) === 'function') {
            return await handler[action](...content);
        }

        //-----------------------------------

        return null;
    }

    public async dispose():Promise<void> {
        // empty..
    }

    public updateState(state:Partial<ModuleState>):Readonly<ModuleState> {
        return this._state = { ...this._state, ...state };
    }

    public get state():Readonly<ModuleState> {
        return this._state;
    }
}
