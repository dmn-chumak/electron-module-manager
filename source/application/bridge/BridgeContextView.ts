export interface BridgeContextView<ModuleState> {
    setState(state:Partial<ModuleState>):void;
}
