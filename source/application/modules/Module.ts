import { Application } from '../Application';
import { BridgeContextView } from '../bridge/BridgeContextView';
import { BridgeContextViewWrapper } from '../bridge/BridgeContextViewWrapper';
import { Window } from '../windows/Window';
import { WindowBaseOptions } from '../windows/WindowBaseOptions';
import { ModuleViewMethodsExtractor } from './ModuleTypeExtractors';

export abstract class AbstractModule<ModuleState = any, ModuleViewType = any> {
    protected readonly _application:Application;
    protected _activeWindow:Window<ModuleState>;
    protected _activeModuleView:ModuleViewType & BridgeContextView<ModuleState>;
    protected readonly _moduleType:number;
    protected _state:ModuleState;

    public constructor(application:Application, moduleType:number, state:ModuleState = null) {
        this._application = application;
        this._activeWindow = null;
        this._activeModuleView = BridgeContextViewWrapper.createDummyContext();
        this._moduleType = moduleType;
        this._state = state;
    }

    public compose(window:Window<ModuleState>):void {
        this._activeModuleView = BridgeContextViewWrapper.createModuleViewContext(window.nativeWebContents, this._moduleType);
        this._activeWindow = window;
    }

    public dispose():void {
        this._activeModuleView = BridgeContextViewWrapper.createDummyContext();
        this._activeWindow = null;
    }

    public updateState(state:Partial<ModuleState>):void {
        this._activeModuleView.setState(state);

        for (const property in state) {
            if (state.hasOwnProperty(property)) {
                this._state[property] = state[property];
            }
        }
    }

    public notifyState(state:Partial<ModuleState>):void {
        this._activeModuleView.setState(state);
    }

    public get windowOptions():Partial<WindowBaseOptions> {
        return null;
    }

    public get moduleType():number {
        return this._moduleType;
    }

    public get activeModuleView():ModuleViewType {
        return this._activeModuleView;
    }

    public get activeWindow():Window<ModuleState> {
        return this._activeWindow;
    }

    public get state():Readonly<ModuleState> {
        return this._state;
    }
}

export abstract class Module<
    ModuleState = any, ModuleViewType = any
> extends AbstractModule<
    ModuleState, ModuleViewMethodsExtractor<ModuleViewType>
> {
    // specifying ModuleView type without internal methods/properties,
    // mostly inherited from React.PureComponent class
}
