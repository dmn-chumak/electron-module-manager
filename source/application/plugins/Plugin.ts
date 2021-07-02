import { Application } from '../Application';
import { BridgeContextView } from '../bridge/BridgeContextView';
import { BridgeContextViewWrapper } from '../bridge/BridgeContextViewWrapper';
import { Window } from '../windows/Window';
import { PluginBaseOptions } from './PluginBaseOptions';
import { PluginViewMethodsExtractor } from './PluginTypeExtractors';

export abstract class AbstractPlugin<PluginState = any, PluginConfig = any, PluginViewType = any> {
    protected readonly _application:Application;
    protected _activeWindow:Window;
    protected _activePluginView:PluginViewType & BridgeContextView<PluginState>;
    protected readonly _pluginType:number;
    protected _state:PluginState;

    protected _isLocked:boolean;

    public constructor(application:Application, pluginType:number) {
        this._application = application;
        this._activeWindow = null;
        this._activePluginView = BridgeContextViewWrapper.createDummyContext();
        this._pluginType = pluginType;
        this._state = null;
        this._isLocked = false;
    }

    public attach(window:Window):void {
        this._activePluginView = BridgeContextViewWrapper.createPluginViewContext(window.nativeWebContents, this._pluginType);
        this._activeWindow = window;
        this._activeWindow.attachPlugin(this);
    }

    public detach():void {
        this._activeWindow.detachPlugin(this);
        this._activePluginView = BridgeContextViewWrapper.createDummyContext();
        this._activeWindow = null;
    }

    public updateState(state:Partial<PluginState>):void {
        this._activePluginView.setState(state);

        for (const property in state) {
            if (state.hasOwnProperty(property)) {
                this._state[property] = state[property];
            }
        }
    }

    public notifyState(state:Partial<PluginState>):void {
        this._activePluginView.setState(state);
    }

    public initState():void {
        // empty..
    }

    public loadStateFromConfig(version:string, config:Readonly<PluginConfig>):void {
        // empty..
    }

    public resetState():void {
        // empty..
    }

    public saveStateToConfig():Readonly<PluginConfig> {
        return null;
    }

    public tryLockPluginManipulation():boolean {
        if (!this._isLocked) {
            return (this._isLocked = true);
        }

        return false;
    }

    public unlockPlugin():void {
        this._isLocked = false;
    }

    public get pluginOptions():Partial<PluginBaseOptions> {
        return null;
    }

    public get pluginType():number {
        return this._pluginType;
    }

    public get activePluginView():PluginViewType {
        return this._activePluginView;
    }

    public get activeWindow():Window {
        return this._activeWindow;
    }

    public get state():PluginState {
        return this._state;
    }
}

export abstract class Plugin<
    PluginState = any, PluginViewType = any
> extends AbstractPlugin<
    PluginState, PluginViewMethodsExtractor<PluginViewType>
> {
    // specifying PluginView type without internal methods/properties,
    // mostly inherited from React.PureComponent class
}
