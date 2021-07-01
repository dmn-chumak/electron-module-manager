export const enum BridgeRequestType {
    INCOMING_INITIALIZE_MODULE_WINDOW = 'inc_initializeModuleWindow',

    INCOMING_PROCESS_MODULE_VIEW_REQUEST = 'inc_processModuleViewRequest',
    OUTGOING_PROCESS_MODULE_REQUEST = 'out_processModuleRequest',

    INCOMING_PROCESS_PLUGIN_VIEW_REQUEST = 'inc_processPluginViewRequest',
    OUTGOING_PROCESS_PLUGIN_REQUEST = 'out_processPluginRequest'
}
