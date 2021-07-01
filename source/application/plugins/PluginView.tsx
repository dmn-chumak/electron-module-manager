import * as React from 'react';
import { BridgeContextWrapper } from '../bridge/BridgeContextWrapper';
import { BridgeRemoteCallsHelper } from '../bridge/BridgeRemoteCallsHelper';
import { BridgeRequestType } from '../bridge/BridgeRequestType';
import { Vector } from '../Vector';
import { PluginOptions } from './PluginOptions';
import { PluginStateExtractor } from './PluginTypeExtractors';
import { PluginMethodsExtractor } from './PluginTypeExtractors';

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

    private internal_pluginViewRequestHandler = (pluginType:number, action:string, ...content:Vector<any>) => {
        if (pluginType === this.props.pluginType) {
            BridgeRemoteCallsHelper.execute(this, action, content);
        }
    };

    public override componentDidMount():void {
        BridgeContextWrapper.appendEventListener(
            BridgeRequestType.INCOMING_PROCESS_PLUGIN_VIEW_REQUEST,
            this.internal_pluginViewRequestHandler
        );
    }

    public override componentWillUnmount():void {
        BridgeContextWrapper.removeEventListener(
            BridgeRequestType.INCOMING_PROCESS_PLUGIN_VIEW_REQUEST,
            this.internal_pluginViewRequestHandler
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
    PluginMethodsExtractor<PluginType>, PluginStateExtractor<PluginType> & Partial<PluginState>
> {
    // specifying Plugin type without internal methods/properties,
    // and auto-extracting inherited PluginState type
}
