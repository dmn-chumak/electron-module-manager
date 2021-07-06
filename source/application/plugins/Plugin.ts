import { Application } from '../Application';
import { BridgeContextEntity } from '../bridge/BridgeContextEntity';
import { Window } from '../windows/Window';
import { PluginBaseOptions } from './PluginBaseOptions';

export abstract class Plugin<PluginState = any, PluginConfig = any> extends BridgeContextEntity<PluginState> {
    protected readonly _application:Application;
    protected _activeWindow:Window;
    protected readonly _pluginType:number;
    protected _isLocked:boolean;

    public constructor(application:Application, pluginType:number) {
        super();

        this._application = application;
        this._activeWindow = null;
        this._pluginType = pluginType;
        this._isLocked = false;

        this._state = null;
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

    public attachWindow(window:Window):void {
        this._activeWindow = window;
        this._activeWindow.attachPlugin(this);
    }

    public detachWindow():void {
        this._activeWindow.detachPlugin(this);
        this._activeWindow = null;
    }

    public updateState(state:Partial<Readonly<PluginState>>):void {
        for (const property in state) {
            if (state.hasOwnProperty(property)) {
                this._state[property] = state[property];
            }
        }

        this.updateWithPatch();
    }

    public updateWithPatch():void {
        if (this._activeWindow != null) {
            const updatePatch = this.createUpdatePatch();

            this._activeWindow.updatePluginWithPatch(
                this._pluginType, updatePatch
            );
        }
    }

    public notifyState(state:Partial<Readonly<PluginState>>):void {
        if (this._activeWindow != null) {
            this._activeWindow.updatePluginState(
                this._pluginType, state
            );
        }
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

    public get activeWindow():Window {
        return this._activeWindow;
    }

    public get autoUpdateView():boolean {
        return true;
    }

    public get state():PluginState {
        return this._state;
    }
}
