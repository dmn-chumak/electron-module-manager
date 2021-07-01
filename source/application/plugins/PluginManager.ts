import { Application } from '../Application';
import { Class } from '../Class';
import { Dictionary } from '../Dictionary';
import { Plugin } from './Plugin';

export class PluginManager {
    protected readonly _pluginsList:Dictionary<Plugin>;
    protected readonly _pluginClassesMap:Dictionary<Class<typeof Plugin>>;
    protected readonly _application:Application;

    public constructor(application:Application, pluginClassesMap:Dictionary<Class<typeof Plugin>>) {
        this._pluginsList = {};
        this._pluginClassesMap = pluginClassesMap;
        this._application = application;
    }
}
