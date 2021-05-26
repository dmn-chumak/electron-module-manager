export class WindowBaseOptions {
    moduleTitle?:string;
    moduleIcon?:string;

    forceDevTools?:boolean;
    allowMultipleInstances?:boolean;
    bridgePath?:string;
    notifyStateUpdates?:boolean;
    attachParent?:boolean;

    isFrameless?:boolean;
    isCentered?:boolean;
    isMaximizable?:boolean;
    isMinimizable?:boolean;
    isAutoResizable?:boolean;
    isResizable?:boolean;
    isModal?:boolean;

    minWidth?:number;
    minHeight?:number;
    width?:number;
    height?:number;
}
