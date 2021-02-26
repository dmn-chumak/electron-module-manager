import * as Electron from 'electron';
import { Application } from './Application';
import { BridgeRequestType } from './BridgeRequestType';
import { Module } from './Module';
import { Class } from './typedefs/Class';
import { WindowBaseOptions } from './WindowBaseOptions';
import { WindowOptions } from './WindowOptions';
import { WindowState } from './WindowState';

export class Window<ModuleType extends number, ModuleState = any> {
    protected readonly _module:Module<ModuleType, ModuleState>;

    protected readonly _nativeWindow:Electron.BrowserWindow;
    protected readonly _moduleType:ModuleType;
    protected readonly _windowOptions:WindowBaseOptions;

    protected _isActive:boolean;

    public constructor(application:Application<ModuleType>, windowOptions:WindowBaseOptions, moduleType:ModuleType, moduleClass:Class<Module<ModuleType, ModuleState>>, moduleState:Readonly<ModuleState> = null, parent:Window<ModuleType> = null) {
        if (moduleClass != null) {
            this._module = new moduleClass(application, this, moduleState);
        }

        //-----------------------------------

        this._nativeWindow = new Electron.BrowserWindow(this.createBrowserWindowOptions(windowOptions, parent));
        this._nativeWindow.on('closed', this.nativeWindowCloseHandler);
        this._nativeWindow.on('unmaximize', this.nativeWindowRestoreHandler);
        this._nativeWindow.on('maximize', this.nativeWindowMaximizeHandler);
        this._nativeWindow.webContents.on('did-finish-load', this.nativeWindowLoadedHandler);
        this._nativeWindow.on('focus', this.nativeWindowFocusHandler);
        this._nativeWindow.on('blur', this.nativeWindowBlurHandler);

        //-----------------------------------

        this._windowOptions = windowOptions;
        this._isActive = false;
        this._moduleType = moduleType;
    }

    public async compose(windowPath:string):Promise<void> {
        await this._module.compose();
        await this._nativeWindow.loadFile(windowPath);

        //-----------------------------------

        if (this._windowOptions.moduleIcon != null) {
            this._nativeWindow.setIcon(this._windowOptions.moduleIcon);
        }

        this._nativeWindow.setMenu(null);
        this._nativeWindow.show();
        this._isActive = true;

        //-----------------------------------

        if (this._windowOptions.forceDevTools) {
            this.restoreDevTools();
        }
    }

    protected createBrowserWindowOptions(options:WindowBaseOptions, parent:Window<ModuleType> = null):Electron.BrowserWindowConstructorOptions {
        return {
            webPreferences: {
                defaultEncoding: 'utf-8',
                backgroundThrottling: false,
                webSecurity: true,
                contextIsolation: true,
                preload: options.bridgePath,
                worldSafeExecuteJavaScript: true,
                spellcheck: false,
                sandbox: true
            },
            useContentSize: true,
            maximizable: options.isResizable,
            resizable: options.isResizable,
            minimizable: options.isMinimizable,
            parent: (parent != null ? parent.nativeWindow : null),
            acceptFirstMouse: true,
            modal: options.isModal,
            center: options.isCentered,
            minHeight: options.minHeight,
            minWidth: options.minWidth,
            height: options.height,
            width: options.width,
            title: options.moduleTitle,
            show: false
        };
    }

    protected createWindowOptions():WindowOptions<ModuleType, ModuleState> {
        return {
            ...this._windowOptions,
            moduleType: this._moduleType,
            moduleInitialState: (this._module != null ? this._module.state : null),
            initialState: {
                isMaximized: this._nativeWindow.isMaximized(),
                isBlurred: !this._nativeWindow.isFocused()
            }
        };
    }

    private nativeWindowLoadedHandler = ():void => {
        this._nativeWindow.webContents.send(
            BridgeRequestType.INITIALIZE_WINDOW_STATE,
            this.createWindowOptions()
        );
    };

    private nativeWindowCloseHandler = async ():Promise<void> => {
        await this._module.dispose();
        this._isActive = false;
    };

    private nativeWindowRestoreHandler = ():void => {
        this.updateWindowState({ isMaximized: false });
    };

    private nativeWindowMaximizeHandler = ():void => {
        this.updateWindowState({ isMaximized: true });
    };

    private nativeWindowFocusHandler = ():void => {
        this.updateWindowState({ isBlurred: false });
    };

    private nativeWindowBlurHandler = ():void => {
        this.updateWindowState({ isBlurred: true });
    };

    public updateWindowState(state:Partial<WindowState>):void {
        if (this._isActive) {
            this._nativeWindow.webContents.send(
                BridgeRequestType.UPDATE_WINDOW_STATE,
                state
            );
        }
    }

    public updateModuleState(state:Partial<ModuleState>, notifyView:boolean = false):void {
        if (this._isActive) {
            const fullState = this._module.updateState(state);

            if (notifyView) {
                this._nativeWindow.webContents.send(
                    BridgeRequestType.UPDATE_MODULE_STATE,
                    fullState
                );
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

    public get module():Module<ModuleType, ModuleState> {
        return this._module;
    }

    public get nativeWindow():Electron.BrowserWindow {
        return this._nativeWindow;
    }

    public get moduleType():ModuleType {
        return this._moduleType;
    }
}
