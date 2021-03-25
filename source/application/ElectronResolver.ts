const insideMainProcess = (typeof (window) === 'undefined' || typeof (global) !== 'undefined');

export const Electron = (
    // temporary hotfix - manually skipping "Electron" package import in renderer process
    insideMainProcess ? require('electron') : null
);
