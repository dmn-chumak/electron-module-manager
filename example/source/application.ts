import * as Electron from 'electron';
import { Application } from 'electron-module-manager';
import * as Path from 'path';
import { CounterModule } from './modules/counter_dialog/CounterModule';
import { ModuleType } from './modules/ModuleType';
import { WorkspaceModule } from './modules/workspace/WorkspaceModule';
import { WorkspaceModuleState } from './modules/workspace/WorkspaceModuleState';

//-----------------------------------

const windowPath = Path.resolve(Electron.app.getAppPath(), '../resource/window.html');
const bridgeScriptPath = Path.resolve(Electron.app.getAppPath(), '../output/window.bridge.js');
const application = new Application(
    windowPath, bridgeScriptPath, {
        [ModuleType.WORKSPACE]: WorkspaceModule,
        [ModuleType.COUNTER]: CounterModule
    }
);

//-----------------------------------

Electron.app.on('ready', async () => {
    await application.windowManager.createParent<WorkspaceModuleState>(
        ModuleType.WORKSPACE, {
            counter: 0
        }
    );
});
