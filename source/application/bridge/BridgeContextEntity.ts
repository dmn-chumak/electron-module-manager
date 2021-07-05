import * as JsonPatch from 'fast-json-patch';

export abstract class BridgeContextEntity<StateType = any> {
    private _internalObserver:JsonPatch.Observer<StateType>;
    private _internalState:StateType;

    protected createUpdatePatch():JsonPatch.Operation[] {
        if (this._internalObserver != null) {
            return JsonPatch.generate(this._internalObserver);
        }

        return [];
    }

    protected set _state(value:StateType) {
        if (this._internalState != null) {
            JsonPatch.unobserve(this._internalState, this._internalObserver);
            this._internalObserver = null;
        }

        //-----------------------------------

        this._internalState = value;

        //-----------------------------------

        if (this._internalState != null) {
            this._internalObserver = JsonPatch.observe(this._internalState);
        }
    }

    protected get _state():StateType {
        return this._internalState;
    }
}
