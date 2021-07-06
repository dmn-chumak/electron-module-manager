import * as Electron from 'electron';
import { Application } from '../Application';
import { Class } from '../Class';
import { Module } from '../modules/Module';
import { ModuleManager } from '../modules/ModuleManager';
import { Vector } from '../Vector';
import { Window } from './Window';
import { WindowBaseOptions } from './WindowBaseOptions';

export class WindowManager {
    protected readonly _application:Application;
    protected readonly _windowClass:Class<typeof Window>;
    protected readonly _moduleManager:ModuleManager;
    protected readonly _windowsList:Vector<Window>;

    protected readonly _windowPath:string;
    protected readonly _bridgeScriptPath:string;
    protected _nextChannel:number;

    private _parent:Window;

    public constructor(application:Application, moduleManager:ModuleManager, windowClass:Class<typeof Window>, windowPath:string, bridgeScriptPath:string) {
        this._application = application;
        this._moduleManager = moduleManager;
        this._windowClass = windowClass;

        //-----------------------------------

        this._windowsList = [];
        this._windowPath = windowPath;
        this._bridgeScriptPath = bridgeScriptPath;
        this._nextChannel = 0;

        //-----------------------------------

        this._parent = null;
    }

    public async createWithClass<ModuleState>(windowClass:Class<typeof Window>, moduleType:number, moduleState:ModuleState = null, extraOptions:WindowBaseOptions = null, parent:Window = null):Promise<Window<ModuleState>> {
        const active = this.obtainModuleWindow<ModuleState>(moduleType);

        if (active != null && active.windowOptions.allowMultipleInstances !== true) {
            return active;
        }

        //-----------------------------------

        const module = this._moduleManager.create(moduleType, moduleState);

        const windowOptions = this.createWindowOptions(
            module, extraOptions
        );

        const window = <Window<ModuleState>> new windowClass(
            this._application, this._nextChannel++,
            windowOptions, module, (
                parent || (windowOptions.attachParent ? this._parent : null)
            )
        );

        //-----------------------------------

        await window.compose(this._windowPath);
        window.nativeWindow.on('closed', this.nativeWindowCloseHandler.bind(this));
        this._windowsList.push(window);

        //-----------------------------------

        return window;
    }

    public async createParentWithClass<ModuleState>(windowClass:Class<typeof Window>, moduleType:number, moduleState:ModuleState = null, extraOptions:WindowBaseOptions = null):Promise<Window<ModuleState>> {
        extraOptions = { ...extraOptions, attachParent: false, isModal: false };

        //-----------------------------------

        const window = await this.createWithClass(windowClass, moduleType, moduleState, extraOptions);

        if (this._parent != null) {
            this._parent.close();
        }

        this._parent = window;

        //-----------------------------------

        return window;
    }

    public create<ModuleState>(moduleType:number, moduleState:ModuleState = null, extraOptions:WindowBaseOptions = null, parent:Window = null):Promise<Window<ModuleState>> {
        return this.createWithClass(this._windowClass, moduleType, moduleState, extraOptions, parent);
    }

    public createParent<ModuleState>(moduleType:number, moduleState:ModuleState = null, extraOptions:WindowBaseOptions = null):Promise<Window<ModuleState>> {
        return this.createParentWithClass(this._windowClass, moduleType, moduleState, extraOptions);
    }

    protected nativeWindowCloseHandler(event:Electron.Event & { sender:Electron.BrowserWindow }):void {
        for (let index = 0; index < this._windowsList.length; index++) {
            const window = this._windowsList[index];

            if (window.nativeWindow === event.sender) {
                this._windowsList.splice(index, 1);

                if (this._parent === window) {
                    this._parent = null;
                }

                break;
            }
        }
    }

    protected createWindowOptions(module:Module, extraOptions:WindowBaseOptions):WindowBaseOptions {
        return {
            bridgePath: this._bridgeScriptPath,
            ...module.windowOptions,
            ...extraOptions
        };
    }

    public obtainModule<ModuleState>(moduleType:number):Module<ModuleState> {
        const window = this.obtainModuleWindow<ModuleState>(moduleType);

        if (window != null) {
            return window.module;
        }

        return null;
    }

    public obtainModuleWindow<ModuleState>(moduleType:number):Window<ModuleState> {
        for (const window of this._windowsList) {
            if (window.moduleType === moduleType) {
                return window;
            }
        }

        return null;
    }

    public updateState<ModuleState>(moduleType:number, moduleState:Partial<ModuleState>):void {
        for (const window of this._windowsList) {
            if (window.moduleType === moduleType) {
                window.module.updateState(moduleState);
            }
        }
    }

    public notifyState<ModuleState>(moduleType:number, moduleState:Partial<ModuleState>):void {
        for (const window of this._windowsList) {
            if (window.moduleType === moduleType) {
                window.module.notifyState(moduleState);
            }
        }
    }

    public close(moduleType:number):void {
        for (let index = 0; index < this._windowsList.length; index++) {
            const window = this._windowsList[index];

            if (window.moduleType === moduleType) {
                this._windowsList.splice(index, 1);
                window.close();

                if (this._parent === window) {
                    this._parent = null;
                }

                index--;
            }
        }
    }

    public obtainState<ModuleState>(moduleType:number):ModuleState {
        for (const window of this._windowsList) {
            if (window.moduleType === moduleType) {
                return window.module.state;
            }
        }

        return null;
    }

    public get windowsList():Vector<Window> {
        return this._windowsList;
    }

    public get parent():Window {
        return this._parent;
    }
}
