import * as ElectronTypes from 'electron';
import { Application } from './Application';
import { BridgeRequestType } from './BridgeRequestType';
import { Dictionary } from './declarations/Dictionary';
import { Electron } from './ElectronResolver';
import { Module } from './Module';
import { ModuleWindow } from './ModuleWindow';
import { WindowBaseOptions } from './WindowBaseOptions';
import { WindowOptions } from './WindowOptions';
import { WindowState } from './WindowState';

export class Window<ModuleType extends number, ModuleState = any> implements ModuleWindow<ModuleState> {
    protected readonly _submodulesList:Dictionary<Module<ModuleType>>;
    protected readonly _module:Module<ModuleType, ModuleState>;

    protected readonly _nativeWindow:ElectronTypes.BrowserWindow;
    protected readonly _moduleType:ModuleType;
    protected readonly _windowOptions:WindowBaseOptions;

    protected _isActive:boolean;

    public constructor(application:Application<ModuleType>, windowOptions:WindowBaseOptions, moduleType:ModuleType, module:Module<ModuleType, ModuleState>, parent:Window<ModuleType> = null) {
        this._nativeWindow = new Electron.BrowserWindow(this.createBrowserWindowOptions(windowOptions, parent));
        this._nativeWindow.on('closed', this.nativeWindowCloseHandler.bind(this));
        this._nativeWindow.on('unmaximize', this.nativeWindowRestoreHandler.bind(this));
        this._nativeWindow.on('maximize', this.nativeWindowMaximizeHandler.bind(this));
        this._nativeWindow.webContents.on('preferred-size-changed', this.nativeWindowResizeHandler.bind(this));
        this._nativeWindow.webContents.on('did-finish-load', this.nativeWindowLoadedHandler.bind(this));
        this._nativeWindow.on('focus', this.nativeWindowFocusHandler.bind(this));
        this._nativeWindow.on('blur', this.nativeWindowBlurHandler.bind(this));

        //-----------------------------------

        this._submodulesList = {};
        this._module = module;
        this._windowOptions = windowOptions;
        this._moduleType = moduleType;

        //-----------------------------------

        this._isActive = false;
    }

    public async compose(windowPath:string):Promise<void> {
        await this._module.compose(this);
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

    protected createBrowserWindowOptions(options:WindowBaseOptions, parent:Window<ModuleType> = null):ElectronTypes.BrowserWindowConstructorOptions {
        return {
            webPreferences: {
                defaultEncoding: 'utf-8',
                backgroundThrottling: false,
                webSecurity: true,
                contextIsolation: true,
                enablePreferredSizeMode: options.isAutoResizable,
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
            frame: !options.isFrameless,
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
            moduleInitialState: this._module.state,
            initialState: {
                isMaximized: this._nativeWindow.isMaximized(),
                isBlurred: !this._nativeWindow.isFocused()
            }
        };
    }

    protected nativeWindowResizeHandler(event:ElectronTypes.Event, preferredSize:ElectronTypes.Size):void {
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

    protected nativeWindowLoadedHandler():void {
        this._nativeWindow.webContents.send(
            BridgeRequestType.INITIALIZE_WINDOW_STATE,
            this.createWindowOptions()
        );
    }

    protected async nativeWindowCloseHandler():Promise<void> {
        await this._module.dispose();

        for (const moduleType in this._submodulesList) {
            const module = this._submodulesList[moduleType];

            if (module != null) {
                await module.dispose();
            }
        }

        this._isActive = false;
    }

    protected nativeWindowRestoreHandler():void {
        this.updateWindowState({ isMaximized: false });
    }

    protected nativeWindowMaximizeHandler():void {
        this.updateWindowState({ isMaximized: true });
    }

    protected nativeWindowFocusHandler():void {
        this.updateWindowState({ isBlurred: false });
    }

    protected nativeWindowBlurHandler():void {
        this.updateWindowState({ isBlurred: true });
    }

    public updateWindowState(state:Partial<WindowState>):void {
        if (this._isActive) {
            this._nativeWindow.webContents.send(
                BridgeRequestType.UPDATE_WINDOW_STATE,
                state
            );
        }
    }

    public notifySubModuleView<SubModuleState>(moduleType:ModuleType, state:Partial<SubModuleState>):void {
        if (this._isActive) {
            const module = this._submodulesList[moduleType];

            if (module != null) {
                this._nativeWindow.webContents.send(
                    BridgeRequestType.UPDATE_SUB_MODULE_STATE,
                    moduleType, state
                );
            }
        }
    }

    public notifyModuleView(state:Partial<ModuleState>):void {
        if (this._isActive) {
            this._nativeWindow.webContents.send(
                BridgeRequestType.UPDATE_MODULE_STATE,
                state
            );
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

    public get windowOptions():WindowBaseOptions {
        return this._windowOptions;
    }

    public get submodulesList():Dictionary<Module<ModuleType>> {
        return this._submodulesList;
    }

    public get module():Module<ModuleType, ModuleState> {
        return this._module;
    }

    public get nativeWindow():ElectronTypes.BrowserWindow {
        return this._nativeWindow;
    }

    public get moduleType():ModuleType {
        return this._moduleType;
    }
}
