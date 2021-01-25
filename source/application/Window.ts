import { Application } from './Application';
import { BridgeRequestType } from './BridgeRequestType';
import { Electron } from './ElectronResolver';
import { WindowOptions } from './WindowOptions';
import { WindowState } from './WindowState';

export class Window<ModuleType extends number> {
    protected readonly _moduleType:ModuleType;
    protected readonly _windowOptions:WindowOptions<ModuleType>;
    protected readonly _application:Application<ModuleType>;
    protected _nativeWindow:any /* Electron.BrowserWindow */;

    public constructor(application:Application<ModuleType>, options:WindowOptions<ModuleType>, parent:Window<ModuleType> = null) {
        this._application = application;
        this._moduleType = options.moduleType;

        //-----------------------------------

        this._nativeWindow = new Electron.BrowserWindow({
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
            icon: options.moduleIcon,
            show: false
        });

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
                ...this._windowOptions
            }
        );
    };

    protected windowCloseHandler = ():void => {
        this._nativeWindow = null;
    };

    public async compose(windowPath:string):Promise<void> {
        await this._nativeWindow.loadFile(windowPath);

        //-----------------------------------

        this._nativeWindow.setMenu(null);
        this._nativeWindow.show();

        //-----------------------------------

        if (this._windowOptions.forceDevTools) {
            this.restoreDevTools();
        }
    }

    public updateWindowState(state:WindowState):void {
        if (this._nativeWindow != null) {
            this._nativeWindow.webContents.send(
                BridgeRequestType.UPDATE_WINDOW_STATE,
                state
            );
        }
    }

    public updateModuleState<ModuleState>(state:ModuleState):void {
        if (this._nativeWindow != null) {
            this._nativeWindow.webContents.send(
                BridgeRequestType.UPDATE_MODULE_STATE,
                state
            );
        }
    }

    public restoreDevTools():void {
        if (this._nativeWindow != null) {
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

    public dispose():void {
        if (this._nativeWindow != null) {
            this._nativeWindow.close();
            this._nativeWindow = null;
        }
    }

    public restore():void {
        if (this._nativeWindow != null) {
            if (this._nativeWindow.isMinimized()) {
                this._nativeWindow.restore();
            }

            this._nativeWindow.focus();
        }
    }

    public get nativeWindow():any /* Electron.BrowserWindow */ {
        return this._nativeWindow;
    }

    public get moduleType():ModuleType {
        return this._moduleType;
    }
}
