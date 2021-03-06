import * as JsonPatch from 'fast-json-patch';
import * as React from 'react';
import { BridgeContextUpdateType } from '../bridge/BridgeContextUpdateType';
import { BridgeContextWrapper } from '../bridge/BridgeContextWrapper';
import { BridgeRequestType } from '../bridge/BridgeRequestType';
import { PluginOptions } from './PluginOptions';
import { PluginStateExtractor } from './PluginTypeExtractors';
import { PluginContext } from './PluginTypeExtractors';

export abstract class AbstractPluginView<PluginType = any, PluginState = any> extends React.PureComponent<PluginOptions<PluginState>, PluginState> {
    protected readonly _context:PluginType;

    public constructor(props:PluginOptions<PluginState>) {
        super(props);

        this._context = BridgeContextWrapper.createPluginContext(
            props.channelIndex, props.pluginType
        );

        this.state = {
            ...props.initialState
        };
    }

    private internal_pluginViewUpdateHandler = (pluginType:string, updateType:BridgeContextUpdateType, data:PluginState | JsonPatch.Operation[]) => {
        if (pluginType === this.props.pluginType) {
            if (updateType === BridgeContextUpdateType.JSON_PATCH) {
                this.updateStateWithPatch(data as JsonPatch.Operation[]);
            } else {
                this.updateState(data as PluginState);
            }
        }
    };

    protected updateStateWithPatch(patch:JsonPatch.Operation[]):void {
        const patchResult = JsonPatch.applyPatch(this.state, patch, false, false);
        this.setState(patchResult.newDocument);
    }

    protected updateState(state:PluginState):void {
        this.setState(state);
    }

    public override componentDidMount():void {
        BridgeContextWrapper.appendEventListener(
            BridgeRequestType.PROCESS_PLUGIN_VIEW_UPDATE,
            this.internal_pluginViewUpdateHandler
        );
    }

    public override componentWillUnmount():void {
        BridgeContextWrapper.removeEventListener(
            BridgeRequestType.PROCESS_PLUGIN_VIEW_UPDATE,
            this.internal_pluginViewUpdateHandler
        );
    }

    public override render():React.ReactNode {
        return (
            <div className="plugin" />
        );
    }
}

export abstract class PluginView<
    PluginType = any, PluginState = any
> extends AbstractPluginView<
    PluginContext<PluginType>, PluginStateExtractor<PluginType> & Partial<PluginState>
> {
    // specifying Plugin type without internal methods/properties,
    // and auto-extracting inherited PluginState type
}
