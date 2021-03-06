import * as Electron from 'electron';
import * as JsonPatch from 'fast-json-patch';
import { Application } from '../Application';
import { BridgeContextUpdateType } from '../bridge/BridgeContextUpdateType';
import { BridgeRemoteCallsHelper } from '../bridge/BridgeRemoteCallsHelper';
import { BridgeRequestType } from '../bridge/BridgeRequestType';
import { Module } from '../modules/Module';
import { Plugin } from '../plugins/Plugin';
import { Vector } from '../Vector';
import { WindowBaseOptions } from './WindowBaseOptions';
import { WindowOptions } from './WindowOptions';

export class Window<ModuleState = any> {
    protected readonly _application:Application;
    protected readonly _nativeWindow:Electron.BrowserWindow;
    protected readonly _channelIndex:number;
    protected readonly _pluginsList:Plugin[];
    protected readonly _windowOptions:WindowBaseOptions;
    protected readonly _module:Module<ModuleState>;

    protected _isActive:boolean;

    public constructor(application:Application, channelIndex:number, windowOptions:WindowBaseOptions, module:Module<ModuleState>, parent:Window = null) {
        this._nativeWindow = new Electron.BrowserWindow(this.createBrowserWindowOptions(windowOptions, parent));

        Electron.ipcMain.handle(BridgeRequestType.PROCESS_MODULE_REQUEST + '_' + channelIndex, this.moduleRequestHandler.bind(this));
        Electron.ipcMain.handle(BridgeRequestType.PREPARE_PLUGIN_VIEW_STATE + '_' + channelIndex, this.pluginStateRequestHandler.bind(this));
        Electron.ipcMain.handle(BridgeRequestType.PROCESS_PLUGIN_REQUEST + '_' + channelIndex, this.pluginRequestHandler.bind(this));

        this._nativeWindow.webContents.on('did-finish-load', this.nativeWindowLoadedHandler.bind(this));
        this._nativeWindow.webContents.on('preferred-size-changed', this.nativeWindowResizeHandler.bind(this));
        this._nativeWindow.on('closed', this.nativeWindowCloseHandler.bind(this));

        //-----------------------------------

        this._application = application;
        this._channelIndex = channelIndex;
        this._module = module;
        this._windowOptions = windowOptions;
        this._pluginsList = [];

        //-----------------------------------

        this._isActive = false;
    }

    public async compose(windowPath:string):Promise<void> {
        await this._module.composeWindow(this);
        await this._nativeWindow.loadFile(windowPath);

        //-----------------------------------

        if (this._windowOptions.moduleImage != null) {
            this._nativeWindow.setIcon(this._windowOptions.moduleImage);
        }

        this._nativeWindow.setMenu(null);
        this._isActive = true;
        this._nativeWindow.show();

        //-----------------------------------

        if (this._windowOptions.forceDevTools) {
            this.restoreDevTools();
        }
    }

    protected createBrowserWindowOptions(options:WindowBaseOptions, parent:Window = null):Electron.BrowserWindowConstructorOptions {
        const browserOptions:Electron.BrowserWindowConstructorOptions = {
            webPreferences: {
                defaultEncoding: 'utf-8',
                backgroundThrottling: false,
                webSecurity: true,
                contextIsolation: true,
                allowRunningInsecureContent: false,
                enableRemoteModule: false,
                nodeIntegrationInSubFrames: false,
                nodeIntegration: false,
                enablePreferredSizeMode: options.isAutoResizable,
                preload: options.bridgePath,
                worldSafeExecuteJavaScript: true,
                spellcheck: false,
                sandbox: true
            },
            useContentSize: true,
            maximizable: (options.isMaximizable !== false),
            resizable: (options.isResizable !== false),
            minimizable: (options.isMinimizable !== false),
            movable: (options.isMovable !== false),
            parent: (parent != null ? parent.nativeWindow : null),
            frame: (options.isFrameless !== true),
            acceptFirstMouse: true,
            modal: (options.isModal === true),
            center: (options.isCentered === true),
            x: (options.position != null ? options.position.x : null),
            y: (options.position != null ? options.position.y : null),
            minHeight: options.minHeight,
            minWidth: options.minWidth,
            height: options.height,
            width: options.width,
            title: options.moduleTitle,
            show: false
        };

        //-----------------------------------

        if (options.moduleImage != null) {
            // due to issue in electron, only non-null value should be provided
            browserOptions.icon = options.moduleImage;
        }

        //-----------------------------------

        return browserOptions;
    }

    protected createWindowOptions():WindowOptions<ModuleState> {
        return {
            ...this._windowOptions,
            moduleInitialState: this._module.state,
            moduleType: this._module.moduleType,
            channelIndex: this._channelIndex
        };
    }

    protected nativeWindowResizeHandler(event:Electron.Event, preferredSize:Electron.Size):void {
        if (this._isActive && this._windowOptions.isAutoResizable) {
            const preferredHeight = Math.max(preferredSize.height, this._windowOptions.height);
            const currentSize = this._nativeWindow.getContentSize();

            if (currentSize[1] !== preferredHeight) {
                this._nativeWindow.setContentSize(
                    currentSize[0], preferredHeight
                );
            }
        }
    }

    protected async moduleRequestHandler(event:Electron.IpcMainEvent, moduleType:string, action:string, ...content:Vector<any>):Promise<any> {
        if (this._isActive && this.checkTrustedWebContents(event.sender)) {
            const module = this._module;

            if (module.moduleType === moduleType) {
                const result = await BridgeRemoteCallsHelper.execute(module, action, content);

                if (module.stateAutoUpdateType === BridgeContextUpdateType.STATE) {
                    module.updateViewState(module.state);
                } else if (module.stateAutoUpdateType === BridgeContextUpdateType.JSON_PATCH) {
                    module.updateView();
                } else {
                    // empty..
                }

                return result;
            }
        }

        return null;
    }

    protected async pluginStateRequestHandler(event:Electron.IpcMainEvent, pluginType:string):Promise<any> {
        if (this._isActive && this.checkTrustedWebContents(event.sender)) {
            for (const plugin of this._pluginsList) {
                if (plugin.pluginType === pluginType) {
                    return plugin.state;
                }
            }
        }

        return null;
    }

    protected async pluginRequestHandler(event:Electron.IpcMainEvent, pluginType:string, action:string, ...content:Vector<any>):Promise<any> {
        if (this._isActive && this.checkTrustedWebContents(event.sender)) {
            for (const plugin of this._pluginsList) {
                if (plugin.pluginType === pluginType) {
                    const result = await BridgeRemoteCallsHelper.execute(plugin, action, content);

                    if (plugin.stateAutoUpdateType === BridgeContextUpdateType.STATE) {
                        plugin.updateViewState(plugin.state);
                    } else if (plugin.stateAutoUpdateType === BridgeContextUpdateType.JSON_PATCH) {
                        plugin.updateView();
                    } else {
                        // empty..
                    }

                    return result;
                }
            }
        }

        return null;
    }

    protected checkTrustedWebContents(webContents:Electron.WebContents):boolean {
        return (this.nativeWebContents === webContents);
    }

    protected nativeWindowLoadedHandler():void {
        this._nativeWindow.webContents.send(
            BridgeRequestType.INITIALIZE_MODULE_WINDOW,
            this.createWindowOptions()
        );
    }

    protected async nativeWindowCloseHandler():Promise<void> {
        await this._module.disposeWindow();

        while (this._pluginsList.length > 0) {
            this._pluginsList.pop().detachWindow();
        }

        this._isActive = false;
    }

    public updateModuleWithPatch(moduleType:string, patch:JsonPatch.Operation[]):void {
        if (this._isActive && patch.length > 0) {
            this.nativeWebContents.send(
                BridgeRequestType.PROCESS_MODULE_VIEW_UPDATE, moduleType,
                BridgeContextUpdateType.JSON_PATCH, patch
            );
        }
    }

    public updateModuleState(moduleType:string, state:Partial<Readonly<ModuleState>>):void {
        if (this._isActive) {
            this.nativeWebContents.send(
                BridgeRequestType.PROCESS_MODULE_VIEW_UPDATE, moduleType,
                BridgeContextUpdateType.STATE, state
            );
        }
    }

    public updatePluginWithPatch(pluginType:string, patch:JsonPatch.Operation[]):void {
        if (this._isActive && patch.length > 0) {
            this.nativeWebContents.send(
                BridgeRequestType.PROCESS_PLUGIN_VIEW_UPDATE, pluginType,
                BridgeContextUpdateType.JSON_PATCH, patch
            );
        }
    }

    public updatePluginState(pluginType:string, state:any):void {
        if (this._isActive) {
            this.nativeWebContents.send(
                BridgeRequestType.PROCESS_PLUGIN_VIEW_UPDATE, pluginType,
                BridgeContextUpdateType.STATE, state
            );
        }
    }

    public attachPlugin(plugin:Plugin):void {
        const index = this._pluginsList.indexOf(plugin);

        if (index === -1) {
            this._pluginsList.push(plugin);
        }
    }

    public detachPlugin(plugin:Plugin):void {
        const index = this._pluginsList.indexOf(plugin);

        if (index !== -1) {
            this._pluginsList.splice(index, 1);
        }
    }

    public closeDevTools():void {
        if (this._isActive) {
            const webContents = this._nativeWindow.webContents;

            if (webContents.isDevToolsOpened()) {
                webContents.closeDevTools();
            }
        }
    }

    public restoreDevTools():void {
        if (this._isActive) {
            const webContents = this._nativeWindow.webContents;

            if (webContents.isDevToolsOpened()) {
                webContents.devToolsWebContents.focus();
            } else {
                webContents.openDevTools({
                    mode: 'detach'
                });
            }
        }
    }

    public close():void {
        if (this._isActive) {
            this._nativeWindow.close();
            this._isActive = false;
        }
    }

    public restore():void {
        if (this._isActive) {
            if (this._nativeWindow.isMinimized()) {
                this._nativeWindow.restore();
            }

            this._nativeWindow.focus();
        }
    }

    public get nativeWebContents():Electron.WebContents {
        return this._nativeWindow.webContents;
    }

    public get windowOptions():WindowBaseOptions {
        return this._windowOptions;
    }

    public get module():Module<ModuleState> {
        return this._module;
    }

    public get nativeWindow():Electron.BrowserWindow {
        return this._nativeWindow;
    }

    public get moduleType():string {
        return this._module.moduleType;
    }

    public get isActive():boolean {
        return this._isActive;
    }
}
