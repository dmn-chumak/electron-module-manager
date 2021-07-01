import * as Electron from 'electron';
import { Dictionary } from '../Dictionary';
import { Vector } from '../Vector';
import { BridgeContext } from './BridgeContext';

export class BridgeContextDefault {
    protected readonly _handlersList:Dictionary<(...content:Vector<any>) => void>;
    protected _nextIndex:number;

    public constructor() {
        this._handlersList = {};
        this._nextIndex = 0;
    }

    protected appendEventListener = (requestType:string, handler:(...content:Vector<any>) => void) => {
        const pointer = requestType + '_' + (++this._nextIndex);

        Electron.ipcRenderer.on(
            requestType, this._handlersList[pointer] = (event:Electron.IpcRendererEvent, ...content:Vector<any>) => {
                handler(...content);
            }
        );

        return this._nextIndex;
    };

    protected appendEventListenerOnce = (requestType:string, handler:(...content:Vector<any>) => void) => {
        const pointer = requestType + '_' + (++this._nextIndex);

        Electron.ipcRenderer.once(
            requestType, this._handlersList[pointer] = (event:Electron.IpcRendererEvent, ...content:Vector<any>) => {
                handler(...content);
            }
        );

        return this._nextIndex;
    };

    protected removeEventListener = (requestType:string, index:number) => {
        const pointer = requestType + '_' + index;

        if (this._handlersList[pointer] != null) {
            Electron.ipcRenderer.off(requestType, this._handlersList[pointer]);
            delete this._handlersList[pointer];
        }
    };

    protected invokeRequest = (channelType:string, action:string, ...content:Vector<any>) => {
        return Electron.ipcRenderer.invoke(
            channelType, action, ...content
        );
    };

    public expose():BridgeContext {
        return {
            appendEventListener: this.appendEventListener,
            appendEventListenerOnce: this.appendEventListenerOnce,
            removeEventListener: this.removeEventListener,
            invokeRequest: this.invokeRequest
        };
    }
}
