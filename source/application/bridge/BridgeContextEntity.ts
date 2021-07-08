import * as JsonPatch from 'fast-json-patch';
import { BridgeContextUpdateType } from './BridgeContextUpdateType';

export abstract class BridgeContextEntity<StateType = any> {
    private _internalObserver:JsonPatch.Observer<StateType>;
    private _internalState:StateType;

    public get stateAutoUpdateType():BridgeContextUpdateType {
        return BridgeContextUpdateType.DISABLED;
    }

    public updateState(state:Partial<Readonly<StateType>>, notifyView:boolean = true):void {
        for (const property in state) {
            if (state.hasOwnProperty(property)) {
                this._internalState[property] = state[property];
            }
        }

        if (notifyView) {
            this.updateViewState(state);
        }
    }

    public updateViewState(state:Partial<Readonly<StateType>>):void {
        // empty..
    }

    public updateView():void {
        // empty..
    }

    protected set _state(value:StateType) {
        const updateType = this.stateAutoUpdateType;

        //-----------------------------------

        if (this._internalState != null) {
            if (updateType === BridgeContextUpdateType.JSON_PATCH) {
                JsonPatch.unobserve(this._internalState, this._internalObserver);
                this._internalObserver = null;
            }
        }

        //-----------------------------------

        this._internalState = value;

        //-----------------------------------

        if (this._internalState != null) {
            if (updateType === BridgeContextUpdateType.JSON_PATCH) {
                this._internalObserver = JsonPatch.observe(this._internalState);
            }
        }
    }

    protected createUpdatePatch():JsonPatch.Operation[] {
        if (this._internalObserver != null) {
            return JsonPatch.generate(this._internalObserver);
        }

        return [];
    }

    protected get _state():StateType {
        return this._internalState;
    }
}
