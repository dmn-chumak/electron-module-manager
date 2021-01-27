import { Application } from './Application';
import { Vector } from './typedefs/Vector';
import { WindowOptions } from './WindowOptions';

export abstract class Module<ModuleType extends number, ModuleState = any> {
    protected static readonly FORBIDDEN_METHODS_LIST:Vector<string> = [
        'initialize', 'process', 'resetAndUpdateState', 'updateState', 'constructor'
    ];

    protected readonly _moduleType:ModuleType;
    protected _application:Application<ModuleType>;
    protected _state:ModuleState;

    public constructor(moduleType:ModuleType) {
        this._moduleType = moduleType;
        this._application = null;
        this._state = null;
    }

    public initialize(application:Application<ModuleType>):void {
        this._application = application;
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

    public updateState(state:Partial<ModuleState>):ModuleState {
        return this._state = { ...this._state, ...state };
    }

    public resetAndUpdateState(state:Partial<ModuleState>):ModuleState {
        return this._state = { ...this._state, ...state };
    }

    public get moduleType():Readonly<ModuleType> {
        return this._moduleType;
    }

    public get windowOptions():Partial<WindowOptions<ModuleType>> {
        return {};
    }

    public get state():Readonly<ModuleState> {
        return this._state;
    }
}
