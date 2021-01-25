import { BridgeRequestType } from './BridgeRequestType';
import { Electron } from './ElectronResolver';
import { Module } from './Module';
import { Class } from './typedefs/Class';
import { Dictionary } from './typedefs/Dictionary';
import { Vector } from './typedefs/Vector';
import { Window } from './Window';
import { WindowInitOptions } from './WindowInitOptions';
import { WindowManager } from './WindowManager';
import { WindowOptions } from './WindowOptions';

export class Application<ModuleType extends number> {
    private readonly _windowManager:WindowManager<ModuleType>;
    private readonly _moduleMap:Dictionary<Module<ModuleType>>;

    public constructor(windowPath:string, bridgeScriptPath:string, moduleMap:Dictionary<Class<Module<ModuleType>>>) {
        this._windowManager = new WindowManager<ModuleType>(this, windowPath, bridgeScriptPath);
        this._moduleMap = {};

        //-----------------------------------

        for (const moduleType in moduleMap) {
            if (moduleMap.hasOwnProperty(moduleType)) {
                this._moduleMap[moduleType] = new moduleMap[moduleType]();
                this._moduleMap[moduleType].initialize(this);
            }
        }

        //-----------------------------------

        if (Electron.app.requestSingleInstanceLock()) {
            Electron.app.allowRendererProcessReuse = true;
            Electron.app.applicationMenu = null;

            //-----------------------------------

            Electron.protocol.registerSchemesAsPrivileged([
                {
                    privileges: { standard: true },
                    scheme: 'file'
                }
            ]);

            //-----------------------------------

            this.attachIpcListeners();
            this.attachAppListeners();
            return;
        }

        //-----------------------------------

        Electron.app.quit();
    }

    public async createWindowWithType(windowType:Class<Window<ModuleType>>, options:WindowInitOptions<ModuleType>):Promise<Window<ModuleType>> {
        return await this._windowManager.compose(windowType, this.prepareWindowOptions(options));
    }

    public async createWindow(options:WindowInitOptions<ModuleType>):Promise<Window<ModuleType>> {
        return await this.createWindowWithType(Window, options);
    }

    public async createWindowParentWithType(windowType:Class<Window<ModuleType>>, options:WindowInitOptions<ModuleType>):Promise<Window<ModuleType>> {
        return await this._windowManager.composeParent(windowType, this.prepareWindowOptions(options));
    }

    public async createWindowParent(options:WindowInitOptions<ModuleType>):Promise<Window<ModuleType>> {
        return await this.createWindowWithType(Window, options);
    }

    public closeWindow(moduleType:ModuleType):void {
        this._windowManager.dispose(moduleType);
    }

    public updateState<ModuleState>(moduleType:ModuleType, state:Partial<ModuleState>, notifyView:boolean = false):void {
        const fullState = this._moduleMap[moduleType].updateState(state);

        if (notifyView) {
            this._windowManager.updateState(moduleType, fullState);
        }
    }

    public obtainState<ModuleState>(moduleType:ModuleType):Readonly<ModuleState> {
        return this._moduleMap[moduleType].state;
    }

    private prepareWindowOptions(options:WindowInitOptions<ModuleType>):WindowOptions<ModuleType> {
        options = (typeof(options) === 'number') ? { moduleType: options } : options;

        return {
            ...this._moduleMap[options.moduleType].windowOptions,
            ...options
        };
    }

    private attachIpcListeners():void {
        Electron.ipcMain.handle(
            BridgeRequestType.PROCESS_MODULE_REQUEST,
            async (event:any /* Electron.IpcMainInvokeEvent */, moduleType:ModuleType, action:string, ...content:Vector<any>):Promise<any> => {
                const module = this._moduleMap[moduleType];

                if (module != null) {
                    return await module.process(event.sender, action, ...content);
                }

                return null;
            }
        );
    }

    private attachAppListeners():void {
        Electron.app.on('second-instance', () => {
            if (this._windowManager.parent != null) {
                this._windowManager.parent.restore();
            }
        });

        Electron.app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                Electron.app.quit();
            }
        });

        Electron.app.on('ready', () => {
            // empty..
        });
    }
}
