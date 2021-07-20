import * as Electron from 'electron';
import { BridgeRequestType } from './bridge/BridgeRequestType';
import { Class } from './Class';
import { Dictionary } from './Dictionary';
import { NodeExceptionHandler } from './exceptions/NodeExceptionHandler';
import { Module } from './modules/Module';
import { ModuleManager } from './modules/ModuleManager';
import { Plugin } from './plugins/Plugin';
import { PluginManager } from './plugins/PluginManager';
import { Window } from './windows/Window';
import { WindowManager } from './windows/WindowManager';

export class Application {
    protected readonly _windowManager:WindowManager;
    protected readonly _moduleManager:ModuleManager;
    protected readonly _pluginManager:PluginManager;

    public constructor(windowPath:string, bridgeScriptPath:string, moduleClassesMap:Dictionary<Class<typeof Module>> = null, pluginClassesMap:Dictionary<Class<typeof Plugin>> = null, allowMultipleInstances:boolean = false) {
        this._moduleManager = this.createModuleManager(moduleClassesMap);
        this._windowManager = this.createWindowManager(this._moduleManager, windowPath, bridgeScriptPath);
        this._pluginManager = this.createPluginManager(pluginClassesMap);

        //-----------------------------------

        if (allowMultipleInstances || Electron.app.requestSingleInstanceLock()) {
            Electron.app.allowRendererProcessReuse = true;
            Electron.app.applicationMenu = null;

            //-----------------------------------

            Electron.protocol.registerSchemesAsPrivileged([ { privileges: { standard: true }, scheme: 'file' } ]);

            //-----------------------------------

            Electron.ipcMain.handle(BridgeRequestType.PROCESS_UNHANDLED_ERROR, this.appProcessErrorsHandler.bind(this));
            Electron.app.on('second-instance', this.appSecondInstanceHandler.bind(this));
            Electron.app.on('window-all-closed', this.appAllWindowsClosedHandler.bind(this));
            Electron.app.on('ready', this.appReadyHandler.bind(this));

            //-----------------------------------

            return;
        }

        //-----------------------------------

        Electron.app.quit();
    }

    protected createModuleManager(moduleClassesMap:Dictionary<Class<typeof Module>>):ModuleManager {
        return new ModuleManager(this, moduleClassesMap);
    }

    protected createWindowManager(moduleManager:ModuleManager, windowPath:string, bridgeScriptPath:string):WindowManager {
        return new WindowManager(this, moduleManager, Window, windowPath, bridgeScriptPath);
    }

    protected createPluginManager(pluginClassesMap:Dictionary<Class<typeof Plugin>>):PluginManager {
        return new PluginManager(this, pluginClassesMap);
    }

    protected appProcessErrorsHandler(event:Electron.IpcMainEvent, error:Error):void {
        NodeExceptionHandler.handleError(error);
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

    public get moduleManager():ModuleManager {
        return this._moduleManager;
    }

    public get pluginManager():PluginManager {
        return this._pluginManager;
    }

    public get windowManager():WindowManager {
        return this._windowManager;
    }
}
