export interface ModuleWindow<ModuleState> {
    readonly isActive:boolean;

    notifyModuleView(state:Partial<ModuleState>):void;

    closeDevTools():void;

    restoreDevTools():void;

    close():void;

    restore():void;
}
