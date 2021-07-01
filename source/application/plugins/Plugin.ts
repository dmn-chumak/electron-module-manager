import { Application } from '../Application';
import { BridgeContextView } from '../bridge/BridgeContextView';
import { BridgeContextViewWrapper } from '../bridge/BridgeContextViewWrapper';
import { Window } from '../windows/Window';
import { PluginBaseOptions } from './PluginBaseOptions';
import { PluginViewMethodsExtractor } from './PluginTypeExtractors';

export abstract class AbstractPlugin<PluginState = any, PluginViewType = any> {
    protected readonly _application:Application;
    protected _activeWindow:Window;
    protected _activePluginView:PluginViewType & BridgeContextView<PluginState>;
    protected readonly _pluginType:number;
    protected _state:PluginState;

    public constructor(application:Application, pluginType:number) {
        this._application = application;
        this._activeWindow = null;
        this._activePluginView = BridgeContextViewWrapper.createDummyContext();
        this._pluginType = pluginType;
        this._state = null;
    }

    public attach(window:Window):void {
        this._activePluginView = BridgeContextViewWrapper.createPluginViewContext(window.nativeWebContents, this._pluginType);
        this._activeWindow = window;
    }

    public detach():void {
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
