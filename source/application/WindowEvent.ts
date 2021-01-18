import * as Electron from 'electron';

export interface WindowEvent extends Electron.Event {
    sender?:Electron.BrowserWindow;
}
