import { Application } from './Application';
import { Class } from './typedefs/Class';
import { Vector } from './typedefs/Vector';
import { Window } from './Window';
import { WindowOptions } from './WindowOptions';

export class WindowManager<ModuleType extends number> {
    private readonly _windowList:Vector<Window<ModuleType>>;
    private readonly _application:Application<ModuleType>;
    private readonly _bridgeScriptPath:string;
    private readonly _windowPath:string;
    private _parent:Window<ModuleType>;

    public constructor(application:Application<ModuleType>, windowPath:string, bridgeScriptPath:string) {
        this._application = application;
        this._windowList = [];
        this._bridgeScriptPath = bridgeScriptPath;
        this._windowPath = windowPath;
        this._parent = null;
    }

    protected windowCloseHandler = (event:any /* Electron.Event */):void => {
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

    public async create(windowType:Class<Window<ModuleType>>, options:WindowOptions<ModuleType>):Promise<Window<ModuleType>> {
        options = {
            bridgePath: this._bridgeScriptPath,
            ...options
        };

        //-----------------------------------

        if (options.allowMultipleInstances !== true) {
            for (const window of this._windowList) {
                if (window.moduleType === options.moduleType) {
                    window.restore();
                    return window;
                }
            }
        }

        //-----------------------------------

        const parent = (options.attachParent ? this._parent : null);
        const window = new windowType(this._application, options, parent);

        await window.initialize(this._windowPath);
        window.nativeWindow.on('closed', this.windowCloseHandler);
        this._windowList.push(window);

        //-----------------------------------

        return window;
    }

    public async createParent(windowType:Class<Window<ModuleType>>, options:WindowOptions<ModuleType>):Promise<Window<ModuleType>> {
        const window = await this.create(windowType, {
            ...options,
            attachParent: false,
            isModal: false
        });

        //-----------------------------------

        if (this._parent != null) {
            this._parent.close();
        }

        this._parent = window;

        //-----------------------------------

        return window;
    }

    public updateState<ModuleState>(moduleType:ModuleType, state:ModuleState):void {
        for (const window of this._windowList) {
            if (window.moduleType === moduleType) {
                window.updateModuleState(state);
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

    public get windowList():Vector<Window<ModuleType>> {
        return this._windowList;
    }

    public get parent():Window<ModuleType> {
        return this._parent;
    }
}
