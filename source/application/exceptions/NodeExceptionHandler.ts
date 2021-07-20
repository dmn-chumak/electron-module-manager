import * as Electron from 'electron';
import { AbstractExceptionHandler } from './AbstractExceptionHandler';

export class NodeExceptionHandler extends AbstractExceptionHandler {
    private static _prevError:Error | any = null;

    public static handleError(error:Error | any):void {
        if (this._prevError != null) {
            const { name, message } = this._prevError;

            if (error.message === message && error.name === name) {
                return;
            }
        }

        //-----------------------------------

        Electron.dialog.showMessageBox({
            message: `${ error.name } | ${ error.message }\n${ error.stack }`,
            type: 'error',
            title: 'Unhandled error!'
        });

        //-----------------------------------

        this._prevError = error;
    }

    public static initialize():void {
        process.addListener('unhandledRejection', (error) => {
            this.handleError(error);
        });

        process.addListener('uncaughtException', (error) => {
            this.handleError(error);
        });
    }
}
