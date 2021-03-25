import { BridgeRequestType } from './BridgeRequestType';
import { Electron } from './ElectronResolver';
import { ModuleClass } from './ModuleClass';
import { Class } from './typedefs/Class';
import { Dictionary } from './typedefs/Dictionary';
import { Vector } from './typedefs/Vector';
import { Window } from './Window';
import { WindowBaseOptions } from './WindowBaseOptions';
import { WindowManager } from './WindowManager';

export class Application<ModuleType extends number> {
    protected readonly _windowManager:WindowManager<ModuleType>;

    public constructor(windowPath:string, bridgeScriptPath:string, moduleClassesMap:Dictionary<ModuleClass<ModuleType>> = null, allowMultipleInstances:boolean = false) {
        this._windowManager = new WindowManager<ModuleType>(this, windowPath, bridgeScriptPath, moduleClassesMap);

        //-----------------------------------

        if (allowMultipleInstances || Electron.app.requestSingleInstanceLock()) {
            Electron.app.allowRendererProcessReuse = true;
            Electron.app.applicationMenu = null;

            //-----------------------------------

            Electron.protocol.registerSchemesAsPrivileged([
                { privileges: { standard: true }, scheme: 'file' }
            ]);

            //-----------------------------------

            Electron.ipcMain.handle(BridgeRequestType.PROCESS_MODULE_REQUEST, this.appModuleRequestHandler.bind(this));

            Electron.ipcMain.handle(BridgeRequestType.CREATE_SUB_MODULE, this.appCreateSubModuleHandler.bind(this));
            Electron.ipcMain.handle(BridgeRequestType.PROCESS_SUB_MODULE_REQUEST, this.appSubModuleRequestHandler.bind(this));
            Electron.ipcMain.handle(BridgeRequestType.REMOVE_SUB_MODULE, this.appRemoveSubModuleHandler.bind(this));

            Electron.app.on('second-instance', this.appSecondInstanceHandler.bind(this));
            Electron.app.on('window-all-closed', this.appAllWindowsClosedHandler.bind(this));
            Electron.app.on('ready', this.appReadyHandler.bind(this));

            //-----------------------------------

            return;
        }

        //-----------------------------------

        Electron.app.quit();
    }

    public async createWindowWithType<ModuleState>(windowType:Class<Window<ModuleType, ModuleState>>, moduleType:ModuleType, moduleState:Readonly<ModuleState> = null, windowOptions:WindowBaseOptions = null):Promise<Window<ModuleType, ModuleState>> {
        return await this._windowManager.create(windowType, windowOptions, moduleType, moduleState);
    }

    public async createWindow<ModuleState>(moduleType:ModuleType, moduleState:Readonly<ModuleState> = null, windowOptions:WindowBaseOptions = null):Promise<Window<ModuleType, ModuleState>> {
        return await this.createWindowWithType(Window, moduleType, moduleState, windowOptions);
    }

    public async createWindowParentWithType<ModuleState>(windowType:Class<Window<ModuleType, ModuleState>>, moduleType:ModuleType, moduleState:Readonly<ModuleState> = null, windowOptions:WindowBaseOptions = null):Promise<Window<ModuleType, ModuleState>> {
        return await this._windowManager.createParent(windowType, windowOptions, moduleType, moduleState);
    }

    public async createWindowParent<ModuleState>(moduleType:ModuleType, moduleState:Readonly<ModuleState> = null, windowOptions:WindowBaseOptions = null):Promise<Window<ModuleType, ModuleState>> {
        return await this.createWindowParentWithType(Window, moduleType, moduleState, windowOptions);
    }

    public updateModuleState<ModuleState>(moduleType:ModuleType, moduleState:Readonly<ModuleState>, notifyView:boolean = true):void {
        this._windowManager.updateState(moduleType, moduleState, notifyView);
    }

    public updateSubModuleState<ModuleState>(moduleType:ModuleType, moduleState:Readonly<ModuleState>, notifyView:boolean = true):void {
        this._windowManager.updateSubState(moduleType, moduleState, notifyView);
    }

    public closeWindow(moduleType:ModuleType):void {
        this._windowManager.close(moduleType);
    }

    public obtainModuleState<ModuleState>(moduleType:ModuleType):ModuleState {
        return this._windowManager.obtainState(moduleType);
    }

    protected async appModuleRequestHandler(event:any /* Electron.IpcMainInvokeEvent */, action:string, ...content:Vector<any>):Promise<any> {
        const window = this._windowManager.searchByWebContents(event.sender);

        if (window != null && window.module != null) {
            return await window.module.process(event.sender, action, ...content);
        }

        return null;
    }

    protected async appCreateSubModuleHandler(event:any /* Electron.IpcMainInvokeEvent */, moduleType:ModuleType, moduleState:any = null):Promise<any> {
        const window = this._windowManager.searchByWebContents(event.sender);

        if (window != null) {
            const moduleClass = this._windowManager.moduleClassesMap[moduleType];

            const module = new moduleClass(this, window, moduleState);
            window.submodulesList[moduleType] = module;
            await module.compose();

            return module.state;
        }

        return null;
    }

    protected async appSubModuleRequestHandler(event:any /* Electron.IpcMainInvokeEvent */, moduleType:ModuleType, action:string, ...content:Vector<any>):Promise<any> {
        const window = this._windowManager.searchByWebContents(event.sender);

        if (window != null) {
            const module = window.submodulesList[moduleType];

            if (module != null) {
                return await module.process(event.sender, action, ...content);
            }
        }

        return null;
    }

    protected async appRemoveSubModuleHandler(event:any /* Electron.IpcMainInvokeEvent */, moduleType:ModuleType):Promise<void> {
        const window = this._windowManager.searchByWebContents(event.sender);

        if (window != null) {
            const module = window.submodulesList[moduleType];

            if (module != null) {
                window.submodulesList[moduleType] = null;
                await module.dispose();
            }
        }
    }

    protected appSecondInstanceHandler():void {
        if (this._windowManager.parent != null) {
            this._windowManager.parent.restore();
        }
    }

    protected appAllWindowsClosedHandler():void {
        if (process.platform !== 'darwin') {
            Electron.app.quit();
        }
    }

    protected appReadyHandler():void {
        // empty..
    }

    public get windowOptions():Partial<WindowBaseOptions> {
        return null;
    }

    public get windowManager():WindowManager<ModuleType> {
        return this._windowManager;
    }
}
