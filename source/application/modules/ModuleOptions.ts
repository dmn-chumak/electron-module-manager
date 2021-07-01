export interface ModuleOptions<ModuleState = any> {
    initialState?:Readonly<ModuleState>;
    moduleType:number;
    channelIndex:number;
}
