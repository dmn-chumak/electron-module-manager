import { Application } from './Application';
import { ModuleClass } from './ModuleClass';
import { Class } from './typedefs/Class';
import { Dictionary } from './typedefs/Dictionary';
import { Vector } from './typedefs/Vector';
import { Window } from './Window';
import { WindowBaseOptions } from './WindowBaseOptions';

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

    public async create<ModuleState>(windowClass:Class<Window<ModuleType, ModuleState>>, windowOptions:WindowBaseOptions, moduleType:ModuleType, moduleState:Readonly<ModuleState> = null):Promise<Window<ModuleType, ModuleState>> {
        windowOptions = { bridgePath: this._bridgeScriptPath, ...windowOptions };

        //-----------------------------------

        const moduleClass = this._moduleClassesMap[moduleType];

        if (moduleClass != null) {
            windowOptions = {
                ...this._application.windowOptions,
                ...moduleClass.createWindowOptions(),
                ...windowOptions
            };
        }

        if (windowOptions.allowMultipleInstances !== true) {
            for (const window of this._windowList) {
                if (window.moduleType === moduleType) {
                    return window;
                }
            }
        }

        const window = new windowClass(
            this._application, windowOptions, moduleType, moduleClass, moduleState, (
                (windowOptions.attachParent ? this._parent : null)
            )
        );

        //-----------------------------------

        await window.compose(this._windowPath);
        window.nativeWindow.on('closed', this.nativeWindowCloseHandler);
        this._windowList.push(window);

        //-----------------------------------

        return window;
    }

    public async createParent<ModuleState>(windowClass:Class<Window<ModuleType, ModuleState>>, windowOptions:WindowBaseOptions, moduleType:ModuleType, moduleState:Readonly<ModuleState> = null):Promise<Window<ModuleType, ModuleState>> {
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

    private nativeWindowCloseHandler = (event:any /* Electron.Event & { sender:Electron.BrowserWindow } */):void => {
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

    public updateState<ModuleState>(moduleType:ModuleType, state:Partial<ModuleState>, notifyView:boolean = false):void {
        for (const window of this._windowList) {
            if (window.moduleType === moduleType && window.module != null) {
                window.updateModuleState(state, notifyView);
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

    public obtainState<ModuleState>(moduleType:ModuleType):ModuleState {
        for (const window of this._windowList) {
            if (window.moduleType === moduleType && window.module != null) {
                return window.module.state;
            }
        }

        return null;
    }

    public get windowList():Vector<Window<ModuleType>> {
        return this._windowList;
    }

    public get parent():Window<ModuleType> {
        return this._parent;
    }
}
