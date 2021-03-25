export const enum BridgeRequestType {
    INITIALIZE_WINDOW_STATE = 'initializeWindowState',
    UPDATE_WINDOW_STATE = 'updateWindowState',

    PROCESS_MODULE_REQUEST = 'processModuleRequest',
    UPDATE_MODULE_STATE = 'updateModuleState',

    CREATE_SUB_MODULE = 'createSubModule',
    PROCESS_SUB_MODULE_REQUEST = 'processSubModuleRequest',
    UPDATE_SUB_MODULE_STATE = 'updateSubModuleState',
    REMOVE_SUB_MODULE = 'removeSubModule'
}
