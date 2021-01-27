export interface WindowOptions<ModuleType> {
    moduleType:ModuleType;
    moduleViewMap?:any;
    moduleInitialState?:any;
    moduleTitle?:string;
    moduleIcon?:string;

    forceDevTools?:boolean;
    allowMultipleInstances?:boolean;
    bridgePath?:string;
    attachParent?:boolean;

    windowInitialState?:any;
    isCentered?:boolean;
    isMinimizable?:boolean;
    isResizable?:boolean;
    isModal?:boolean;

    minWidth?:number;
    minHeight?:number;
    width?:number;
    height?:number;
}
