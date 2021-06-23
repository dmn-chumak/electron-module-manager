import * as Electron from 'electron';
import { BridgeRequestType } from './BridgeRequestType';
import { Dictionary } from './declarations/Dictionary';
import { Vector } from './declarations/Vector';
import { ModuleClass } from './ModuleClass';
import { ModuleOptions } from './ModuleOptions';
import { RemoteCallsHelper } from './RemoteCallsHelper';
import { SubModuleWindow } from './submodules/SubModuleWindow';
import { Window } from './Window';
import { WindowBaseOptions } from './WindowBaseOptions';
import { WindowClass } from './WindowClass';
import { WindowManager } from './WindowManager';

export class Application<ModuleType extends number> {
    protected readonly _windowManager:WindowManager<ModuleType>;
    protected readonly _windowClass:WindowClass<ModuleType>;

    public constructor(windowPath:string, bridgeScriptPath:string, moduleClassesMap:Dictionary<ModuleClass<ModuleType>> = null, allowMultipleInstances:boolean = false) {
        this._windowManager = new WindowManager<ModuleType>(this, windowPath, bridgeScriptPath, moduleClassesMap);
        this._windowClass = Window;

        //-----------------------------------

        if (allowMultipleInstances || Electron.app.requestSingleInstanceLock()) {
            Electron.app.allowRendererProcessReuse = true;
            Electron.app.applicationMenu = null;

            //-----------------------------------

            Electron.protocol.registerSchemesAsPrivileged([
                { privileges: { standard: true }, scheme: 'file' }
            ]);

            //-----------------------------------

            Electron.ipcMain.handle(BridgeRequestType.OUTGOING_PROCESS_MODULE_REQUEST, this.appModuleRequestHandler.bind(this));

            Electron.ipcMain.handle(BridgeRequestType.OUTGOING_CREATE_SUB_MODULE, this.appCreateSubModuleHandler.bind(this));
            Electron.ipcMain.handle(BridgeRequestType.OUTGOING_PROCESS_SUB_MODULE_REQUEST, this.appSubModuleRequestHandler.bind(this));
            Electron.ipcMain.handle(BridgeRequestType.OUTGOING_REMOVE_SUB_MODULE, this.appRemoveSubModuleHandler.bind(this));

            Electron.app.on('second-instance', this.appSecondInstanceHandler.bind(this));
            Electron.app.on('window-all-closed', this.appAllWindowsClosedHandler.bind(this));
            Electron.app.on('ready', this.appReadyHandler.bind(this));

            //-----------------------------------

            return;
        }

        //-----------------------------------

        Electron.app.quit();
    }

    public async createWindowWithType<ModuleState>(windowClass:WindowClass<ModuleType, ModuleState>, moduleType:ModuleType, moduleState:Readonly<ModuleState> = null, windowOptions:WindowBaseOptions = null, parent:Window<any> = null):Promise<Window<ModuleType, ModuleState>> {
        return await this._windowManager.create(windowClass, windowOptions, moduleType, moduleState, parent);
    }

    public async createWindow<ModuleState>(moduleType:ModuleType, moduleState:Readonly<ModuleState> = null, windowOptions:WindowBaseOptions = null, parent:Window<any> = null):Promise<Window<ModuleType, ModuleState>> {
        return await this.createWindowWithType(this._windowClass, moduleType, moduleState, windowOptions, parent);
    }

    public async createWindowParentWithType<ModuleState>(windowClass:WindowClass<ModuleType, ModuleState>, moduleType:ModuleType, moduleState:Readonly<ModuleState> = null, windowOptions:WindowBaseOptions = null):Promise<Window<ModuleType, ModuleState>> {
        return await this._windowManager.createParent(windowClass, windowOptions, moduleType, moduleState);
    }

    public async createWindowParent<ModuleState>(moduleType:ModuleType, moduleState:Readonly<ModuleState> = null, windowOptions:WindowBaseOptions = null):Promise<Window<ModuleType, ModuleState>> {
        return await this.createWindowParentWithType(this._windowClass, moduleType, moduleState, windowOptions);
    }

    public updateModuleState<ModuleState>(moduleType:ModuleType, moduleState:Partial<ModuleState>, notifyView:boolean = true):void {
        this._windowManager.updateState(moduleType, moduleState, notifyView);
    }

    public updateSubModuleState<ModuleState>(moduleType:ModuleType, moduleState:Partial<ModuleState>, notifyView:boolean = true):void {
        this._windowManager.updateSubState(moduleType, moduleState, notifyView);
    }

    public closeWindow(moduleType:ModuleType):void {
        this._windowManager.close(moduleType);
    }

    public obtainModuleState<ModuleState>(moduleType:ModuleType):Readonly<ModuleState> {
        return this._windowManager.obtainState(moduleType);
    }

    protected async appModuleRequestHandler(event:Electron.IpcMainInvokeEvent, action:string, ...content:Vector<any>):Promise<any> {
        const window = this._windowManager.searchByWebContents(event.sender);

        if (window != null) {
            return await RemoteCallsHelper.execute(window.module, action, ...content);
        }

        return null;
    }

    protected async appCreateSubModuleHandler<ModuleState>(event:Electron.IpcMainInvokeEvent, moduleType:ModuleType, moduleState:Readonly<ModuleState> = null):Promise<ModuleOptions<ModuleType>> {
        const window = this._windowManager.searchByWebContents(event.sender);

        if (window != null) {
            const moduleClass = this._windowManager.moduleClassesMap[moduleType];
            const module = new moduleClass(this, moduleState);

            const moduleWindow = new SubModuleWindow(window, moduleType, module);
            window.submodulesList[moduleType] = module;
            await moduleWindow.compose();

            return {
                initialState: module.state,
                moduleType
            };
        }

        return null;
    }

    protected async appSubModuleRequestHandler(event:Electron.IpcMainInvokeEvent, moduleType:ModuleType, action:string, ...content:Vector<any>):Promise<any> {
        const window = this._windowManager.searchByWebContents(event.sender);

        if (window != null) {
            const module = window.submodulesList[moduleType];

            if (module != null) {
                return await RemoteCallsHelper.execute(module, action, ...content);
            }
        }

        return null;
    }

    protected async appRemoveSubModuleHandler(event:Electron.IpcMainInvokeEvent, moduleType:ModuleType):Promise<void> {
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

    public get windowOptions():Readonly<Partial<WindowBaseOptions>> {
        return null;
    }

    public get windowManager():WindowManager<ModuleType> {
        return this._windowManager;
    }
}
