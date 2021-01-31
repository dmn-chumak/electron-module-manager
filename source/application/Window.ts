import { Application } from './Application';
import { BridgeRequestType } from './BridgeRequestType';
import { Electron } from './ElectronResolver';
import { WindowOptions } from './WindowOptions';
import { WindowState } from './WindowState';

export class Window<ModuleType extends number> {
    protected readonly _moduleType:ModuleType;
    protected readonly _nativeWindow:any /* Electron.BrowserWindow */;
    protected readonly _windowOptions:WindowOptions<ModuleType>;
    protected readonly _application:Application<ModuleType>;

    protected _isActive:boolean;

    public constructor(application:Application<ModuleType>, options:WindowOptions<ModuleType>, parent:Window<ModuleType> = null) {
        this._application = application;
        this._moduleType = options.moduleType;
        this._isActive = false;

        //-----------------------------------

        this._nativeWindow = new Electron.BrowserWindow(
            this.createBrowserWindowOptions(options, parent)
        );

        //-----------------------------------

        this._nativeWindow.on('closed', this.windowCloseHandler);
        this._nativeWindow.on('unmaximize', this.windowRestoreHandler);
        this._nativeWindow.on('maximize', this.windowMaximizeHandler);
        this._nativeWindow.webContents.on('did-finish-load', this.windowLoadedHandler);
        this._nativeWindow.on('focus', this.windowFocusHandler);
        this._nativeWindow.on('blur', this.windowBlurHandler);

        //-----------------------------------

        this._windowOptions = options;
    }

    protected windowRestoreHandler = ():void => {
        this.updateWindowState({ isMaximized: false });
    };

    protected windowMaximizeHandler = ():void => {
        this.updateWindowState({ isMaximized: true });
    };

    protected windowFocusHandler = ():void => {
        this.updateWindowState({ isBlurred: false });
    };

    protected windowBlurHandler = ():void => {
        this.updateWindowState({ isBlurred: true });
    };

    protected windowLoadedHandler = ():void => {
        this._nativeWindow.webContents.send(
            BridgeRequestType.INITIALIZE_WINDOW_STATE, {
                moduleInitialState: this._application.obtainState(this._moduleType),
                ...this._windowOptions,
                windowInitialState: {
                    isMaximized: this._nativeWindow.isMaximized(),
                    isBlurred: !this._nativeWindow.isFocused()
                }
            }
        );
    };

    protected windowCloseHandler = ():void => {
        this._isActive = false;
    };

    public async initialize(windowPath:string):Promise<void> {
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

    protected createBrowserWindowOptions(options:WindowOptions<ModuleType>, parent:Window<ModuleType>):any {
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

    public updateWindowState(state:WindowState):void {
        if (this._isActive) {
            this._nativeWindow.webContents.send(
                BridgeRequestType.UPDATE_WINDOW_STATE,
                state
            );
        }
    }

    public updateModuleState<ModuleState>(state:ModuleState):void {
        if (this._isActive) {
            this._nativeWindow.webContents.send(
                BridgeRequestType.UPDATE_MODULE_STATE,
                state
            );
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

    public get moduleType():ModuleType {
        return this._moduleType;
    }

    public get nativeWindow():any /* Electron.BrowserWindow */ {
        return this._nativeWindow;
    }

    public get isActive():boolean {
        return this._isActive;
    }
}
