export interface ModuleOptions<ModuleType extends number, ModuleState = any> {
    initialState?:Readonly<ModuleState>;
    moduleType:ModuleType;
}
