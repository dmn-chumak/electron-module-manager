export interface PluginOptions<PluginState = any> {
    initialState:Readonly<PluginState>;
    pluginType:number;
    channelIndex:number;
}
