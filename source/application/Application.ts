import * as Electron from 'electron';
import { BridgeRequestType } from './BridgeRequestType';
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

            Electron.app.on('second-instance', this.appSecondInstanceHandler.bind(this));
            Electron.app.on('window-all-closed', this.appAllWindowsClosedHandler.bind(this));
            Electron.app.on('ready', this.appReadyHandler.bind(this));

            Electron.ipcMain.handle(
                BridgeRequestType.PROCESS_MODULE_REQUEST,
                this.appModuleRequestHandler.bind(this)
            );

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

    public updateModuleState<ModuleState>(moduleType:ModuleType, moduleState:Readonly<ModuleState>, notifyView:boolean = false):void {
        this._windowManager.updateState(moduleType, moduleState, notifyView);
    }

    public closeWindow(moduleType:ModuleType):void {
        this._windowManager.close(moduleType);
    }

    public obtainModuleState<ModuleState>(moduleType:ModuleType):ModuleState {
        return this._windowManager.obtainState(moduleType);
    }

    protected async appModuleRequestHandler(event:Electron.IpcMainInvokeEvent, action:string, ...content:Vector<any>):Promise<any> {
        for (const window of this._windowManager.windowList) {
            if (window.nativeWindow.webContents === event.sender && window.module != null) {
                return await window.module.process(event.sender, action, ...content);
            }
        }

        return null;
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

    public get windowManager():WindowManager<ModuleType> {
        return this._windowManager;
    }
}
