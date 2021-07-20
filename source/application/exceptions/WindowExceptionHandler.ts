import { BridgeContextWrapper } from '../bridge/BridgeContextWrapper';
import { BridgeRequestType } from '../bridge/BridgeRequestType';
import { AbstractExceptionHandler } from './AbstractExceptionHandler';

export class WindowExceptionHandler extends AbstractExceptionHandler {
    public static handleError(error:Error):void {
        BridgeContextWrapper.context.invokeRequest(
            BridgeRequestType.PROCESS_UNHANDLED_ERROR, {
                name: error.name,
                message: error.message,
                stack: error.stack
            }
        );
    }

    public static initialize():void {
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason);
        });

        window.addEventListener('error', (event) => {
            this.handleError(event.error);
        });
    }
}
