export interface PluginOptions<PluginState = any> {
    initialState:Readonly<PluginState>;
    pluginType:string;
    channelIndex:number;
}
