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

    public initFromConfig(version:string, pluginsConfig:Dictionary<any>):void {
        for (const pluginType of Object.keys(this._pluginClassesMap)) {
            const pluginClass = this._pluginClassesMap[pluginType];
            const config = pluginsConfig[pluginType];

            if (pluginClass != null) {
                const plugin = new pluginClass(this._application, parseInt(pluginType));
                this._pluginsList[pluginType] = plugin;

                if (config != null) {
                    plugin.loadStateFromConfig(version, config);
                } else {
                    plugin.initState();
                }
            }
        }
    }

    public saveConfig():Dictionary<any> {
        const pluginsConfig:Dictionary<any> = {};

        for (const pluginType of Object.keys(this._pluginsList)) {
            const config = this._pluginsList[pluginType].saveStateToConfig();

            if (config != null) {
                pluginsConfig[pluginType] = config;
            }
        }

        return pluginsConfig;
    }

    public resetPlugins():void {
        for (const plugin of Object.values(this._pluginsList)) {
            plugin.resetState();
        }
    }
}