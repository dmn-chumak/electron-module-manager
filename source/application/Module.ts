import { Application } from './Application';
import { Vector } from './typedefs/Vector';

export abstract class Module<ModuleType extends number, ModuleState = any> {
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

        if (action !== 'process' && typeof (handler[action]) === 'function') {
            return await handler[action](...content);
        }

        //-----------------------------------

        return null;
    }

    public updateState(state:Partial<ModuleState>):ModuleState {
        return this._state = { ...this._state, ...state };
    }

    public get moduleType():Readonly<ModuleType> {
        return this._moduleType;
    }

    public get state():Readonly<ModuleState> {
        return this._state;
    }
}
