import * as Electron from 'electron';

export class WindowBaseOptions {
    moduleTitle?:string;
    moduleImage?:string;

    forceDevTools?:boolean;
    allowMultipleInstances?:boolean;
    bridgePath?:string;
    attachParent?:boolean;

    isFrameless?:boolean;
    isCentered?:boolean;
    isMaximizable?:boolean;
    isMinimizable?:boolean;
    isAutoResizable?:boolean;
    isResizable?:boolean;
    isModal?:boolean;
    isMovable?:boolean;

    position?:Electron.Point;
    minWidth?:number;
    minHeight?:number;
    width?:number;
    height?:number;
}
