import { WindowView } from 'electron-module-manager/output/WindowView';
import { WindowProcessWorker } from 'electron-module-manager/output/workers/WindowProcessWorker';
import { CounterModuleView } from './modules/counter_dialog/CounterModuleView';
import { ModuleType } from './modules/ModuleType';
import { WorkspaceModuleView } from './modules/workspace/WorkspaceModuleView';

WindowProcessWorker.createWindow(
    WindowView, '#application', {
        [ModuleType.WORKSPACE]: WorkspaceModuleView,
        [ModuleType.COUNTER]: CounterModuleView
    }
);
