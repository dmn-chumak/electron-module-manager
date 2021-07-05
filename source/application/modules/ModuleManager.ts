import { Application } from '../Application';
import { Class } from '../Class';
import { Dictionary } from '../Dictionary';
import { Module } from './Module';

export class ModuleManager {
    protected readonly _moduleClassesMap:Dictionary<Class<typeof Module>>;
    protected readonly _application:Application;

    public constructor(application:Application, moduleClassesMap:Dictionary<Class<typeof Module>>) {
        this._moduleClassesMap = moduleClassesMap;
        this._application = application;
    }

    public create<ModuleState = any>(moduleType:number, state:ModuleState = null):Module {
        const moduleClass = this._moduleClassesMap[moduleType];

        return new moduleClass(
            this._application, moduleType, state
        );
    }
}
