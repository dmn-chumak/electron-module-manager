import { WindowView } from 'electron-module-manager';
import { WindowProcessWorker } from 'electron-module-manager';
import { WindowExceptionHandler } from '../../source';
import { CounterModuleView } from './modules/counter_dialog/CounterModuleView';
import { ModuleType } from './modules/ModuleType';
import { WorkspaceModuleView } from './modules/workspace/WorkspaceModuleView';

//-----------------------------------

WindowExceptionHandler.initialize();

//-----------------------------------

WindowProcessWorker.createWindow(
    WindowView, '#application', {
        [ModuleType.WORKSPACE]: WorkspaceModuleView,
        [ModuleType.COUNTER]: CounterModuleView
    }
);
