import * as Electron from 'electron';
import { Application } from './Application';
import { Dictionary } from './declarations/Dictionary';
import { Vector } from './declarations/Vector';
import { ModuleClass } from './ModuleClass';
import { Window } from './Window';
import { WindowBaseOptions } from './WindowBaseOptions';
import { WindowClass } from './WindowClass';

export class WindowManager<ModuleType extends number> {
    private readonly _windowList:Vector<Window<ModuleType>>;
    private readonly _moduleClassesMap:Dictionary<ModuleClass<ModuleType>>;
    private readonly _application:Application<ModuleType>;
    private readonly _bridgeScriptPath:string;
    private readonly _windowPath:string;

    private _parent:Window<ModuleType>;

    public constructor(application:Application<ModuleType>, windowPath:string, bridgeScriptPath:string, moduleClassesMap:Dictionary<ModuleClass<ModuleType>>) {
        this._application = application;
        this._moduleClassesMap = moduleClassesMap;
        this._windowList = [];
        this._bridgeScriptPath = bridgeScriptPath;
        this._windowPath = windowPath;
        this._parent = null;
    }

    public async create<ModuleState>(windowClass:WindowClass<ModuleType, ModuleState>, windowOptions:WindowBaseOptions, moduleType:ModuleType, moduleState:Readonly<ModuleState> = null):Promise<Window<ModuleType, ModuleState>> {
        for (const window of this._windowList) {
            if (window.moduleType === moduleType) {
                const module = window.module;

                if (module.windowOptions.allowMultipleInstances !== true) {
                    window.restore();
                    return window;
                }
            }
        }

        //-----------------------------------

        const moduleClass = this._moduleClassesMap[moduleType];

        const module = new moduleClass(
            this._application,
            moduleState
        );

        //-----------------------------------

        windowOptions = {
            bridgePath: this._bridgeScriptPath,
            ...this._application.windowOptions,
            ...module.windowOptions,
            ...windowOptions
        };

        //-----------------------------------

        const windowParent = (windowOptions.attachParent ? this._parent : null);

        const window = new windowClass(
            this._application,
            windowOptions,
            moduleType, module,
            windowParent
        );

        //-----------------------------------

        await window.compose(this._windowPath);
        window.nativeWindow.on('closed', this.nativeWindowCloseHandler);
        this._windowList.push(window);

        //-----------------------------------

        return window;
    }

    public async createParent<ModuleState>(windowClass:WindowClass<ModuleType, ModuleState>, windowOptions:WindowBaseOptions, moduleType:ModuleType, moduleState:Readonly<ModuleState> = null):Promise<Window<ModuleType, ModuleState>> {
        windowOptions = { ...windowOptions, attachParent: false, isModal: false };

        //-----------------------------------

        const window = await this.create(windowClass, windowOptions, moduleType, moduleState);

        if (this._parent != null) {
            this._parent.close();
        }

        this._parent = window;

        //-----------------------------------

        return window;
    }

    private nativeWindowCloseHandler = (event:Electron.Event & { sender:Electron.BrowserWindow }):void => {
        for (let index = 0; index < this._windowList.length; index++) {
            const window = this._windowList[index];

            if (window.nativeWindow === event.sender) {
                this._windowList.splice(index, 1);

                if (this._parent === window) {
                    this._parent = null;
                }

                break;
            }
        }
    };

    public searchByModuleType(moduleType:ModuleType):Window<ModuleType> {
        for (const window of this._windowList) {
            if (window.moduleType === moduleType) {
                return window;
            }
        }

        return null;
    }

    public searchByWebContents(contents:Electron.WebContents):Window<ModuleType> {
        for (const window of this._windowList) {
            if (window.nativeWindow.webContents === contents) {
                return window;
            }
        }

        return null;
    }

    public updateState<ModuleState>(moduleType:ModuleType, moduleState:Partial<ModuleState>, notifyView:boolean = true):void {
        for (const window of this._windowList) {
            if (window.moduleType === moduleType) {
                window.module.updateState(moduleState, notifyView);
            }
        }
    }

    public updateSubState<ModuleState>(moduleType:ModuleType, moduleState:Partial<ModuleState>, notifyView:boolean = true):void {
        for (const window of this._windowList) {
            if (window.submodulesList[moduleType] != null) {
                const module = window.submodulesList[moduleType];

                if (module != null) {
                    module.updateState(moduleState, notifyView);
                }
            }
        }
    }

    public close(moduleType:ModuleType):void {
        for (let index = 0; index < this._windowList.length; index++) {
            const window = this._windowList[index];

            if (window.moduleType === moduleType) {
                this._windowList.splice(index, 1);
                window.close();

                if (this._parent === window) {
                    this._parent = null;
                }

                index--;
            }
        }
    }

    public obtainState<ModuleState>(moduleType:ModuleType):Readonly<ModuleState> {
        for (const window of this._windowList) {
            if (window.moduleType === moduleType) {
                return window.module.state;
            }
        }

        return null;
    }

    public get windowList():Vector<Window<ModuleType>> {
        return this._windowList;
    }

    public get moduleClassesMap():Dictionary<ModuleClass<ModuleType>> {
        return this._moduleClassesMap;
    }

    public get parent():Window<ModuleType> {
        return this._parent;
    }
}
