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
    protected readonly _windowManager:WindowManager<ModuleType>;
    protected readonly _moduleMap:Dictionary<Module<ModuleType>>;

    public constructor(windowPath:string, bridgeScriptPath:string, moduleMap:Dictionary<Class<Module<ModuleType>>>, allowMultipleInstances:boolean = false) {
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

    public async createWindowWithType(windowType:Class<Window<ModuleType>>, options:WindowInitOptions<ModuleType>):Promise<Window<ModuleType>> {
        return await this._windowManager.create(windowType, this.prepareWindowOptions(options));
    }

    public async createWindow(options:WindowInitOptions<ModuleType>):Promise<Window<ModuleType>> {
        return await this.createWindowWithType(Window, options);
    }

    public async createWindowParentWithType(windowType:Class<Window<ModuleType>>, options:WindowInitOptions<ModuleType>):Promise<Window<ModuleType>> {
        return await this._windowManager.createParent(windowType, this.prepareWindowOptions(options));
    }

    public async createWindowParent(options:WindowInitOptions<ModuleType>):Promise<Window<ModuleType>> {
        return await this.createWindowParentWithType(Window, options);
    }

    public closeWindow(moduleType:ModuleType):void {
        this._windowManager.close(moduleType);
    }

    public updateState<ModuleState>(moduleType:ModuleType, state:Partial<ModuleState>, notifyView:boolean = false):void {
        const fullState = this._moduleMap[moduleType].updateState(state);

        if (notifyView) {
            this._windowManager.updateState(moduleType, fullState);
        }
    }

    public resetAndUpdateState<ModuleState>(moduleType:ModuleType, state:Partial<ModuleState>, notifyView:boolean = false):void {
        const fullState = this._moduleMap[moduleType].resetAndUpdateState(state);

        if (notifyView) {
            this._windowManager.updateState(moduleType, fullState);
        }
    }

    public obtainState<ModuleState>(moduleType:ModuleType):Readonly<ModuleState> {
        return this._moduleMap[moduleType].state;
    }

    protected prepareWindowOptions(options:WindowInitOptions<ModuleType>):WindowOptions<ModuleType> {
        options = (typeof (options) === 'number') ? { moduleType: options } : options;

        return {
            ...this._moduleMap[options.moduleType].windowOptions,
            ...options
        };
    }

    protected async appModuleRequestHandler(event:any /* Electron.IpcMainInvokeEvent */, moduleType:ModuleType, action:string, ...content:Vector<any>):Promise<any> {
        const module = this._moduleMap[moduleType];

        if (module != null) {
            return await module.process(event.sender, action, ...content);
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
