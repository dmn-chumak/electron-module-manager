export interface ModuleWindow<ModuleState> {
    notifyModuleView(state:Partial<ModuleState>):void;

    closeDevTools():void;

    restoreDevTools():void;

    close():void;

    restore():void;
}
