export interface WorkspaceModuleContext {
    createCounterDialog():Promise<void>;
    closeAllDialogs():Promise<void>;
}
