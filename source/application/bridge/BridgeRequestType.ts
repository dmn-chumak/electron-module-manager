export const enum BridgeRequestType {
    INITIALIZE_MODULE_WINDOW = 'initializeModuleWindow',

    PROCESS_MODULE_VIEW_UPDATE = 'processModuleViewUpdate',
    PROCESS_MODULE_REQUEST = 'processModuleRequest',

    PROCESS_PLUGIN_VIEW_UPDATE = 'processPluginViewUpdate',
    PROCESS_PLUGIN_REQUEST = 'processPluginRequest',
    PREPARE_PLUGIN_VIEW_STATE = 'preparePluginViewState',

    PROCESS_UNHANDLED_ERROR = 'processUnhandledError'
}
