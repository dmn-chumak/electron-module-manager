export interface ModuleOptions<ModuleState = any> {
    initialState:Readonly<ModuleState>;
    moduleType:string;
    channelIndex:number;
}
