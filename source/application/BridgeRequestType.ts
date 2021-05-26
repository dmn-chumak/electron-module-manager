export const enum BridgeRequestType {
    INCOMING_INITIALIZE_WINDOW_STATE = 'incoming_initializeWindowState',
    INCOMING_UPDATE_WINDOW_STATE = 'incoming_updateWindowState',

    OUTGOING_PROCESS_MODULE_REQUEST = 'outgoing_processModuleRequest',
    INCOMING_UPDATE_MODULE_STATE = 'incoming_updateModuleState',

    OUTGOING_CREATE_SUB_MODULE = 'outgoing_createSubModule',
    OUTGOING_PROCESS_SUB_MODULE_REQUEST = 'outgoing_processSubModuleRequest',
    INCOMING_UPDATE_SUB_MODULE_STATE = 'incoming_updateSubModuleState',
    OUTGOING_REMOVE_SUB_MODULE = 'outgoing_removeSubModule'
}
