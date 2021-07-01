import * as React from 'react';
import { BridgeContextWrapper } from '../bridge/BridgeContextWrapper';
import { BridgeRemoteCallsHelper } from '../bridge/BridgeRemoteCallsHelper';
import { BridgeRequestType } from '../bridge/BridgeRequestType';
import { Class } from '../Class';
import { Dictionary } from '../Dictionary';
import { PluginView } from '../plugins/PluginView';
import { Vector } from '../Vector';
import { ModuleOptions } from './ModuleOptions';
import { ModuleStateExtractor } from './ModuleTypeExtractors';
import { ModuleMethodsExtractor } from './ModuleTypeExtractors';

export interface ModuleProps<ModuleState = any> extends ModuleOptions<ModuleState> {
    pluginViewMap?:Dictionary<Class<typeof PluginView>>;
}

export abstract class AbstractModuleView<ModuleType = any, ModuleState = any> extends React.PureComponent<ModuleProps<ModuleState>, ModuleState> {
    protected readonly _context:ModuleType;

    public constructor(props:ModuleProps<ModuleState>) {
        super(props);

        this._context = BridgeContextWrapper.createModuleContext(
            props.channelIndex, props.moduleType
        );

        this.state = {
            ...props.initialState
        };
    }

    private internal_moduleViewRequestHandler = (moduleType:number, action:string, ...content:Vector<any>) => {
        if (moduleType === this.props.moduleType) {
            BridgeRemoteCallsHelper.execute(this, action, content);
        }
    };

    public override componentDidMount():void {
        BridgeContextWrapper.appendEventListener(
            BridgeRequestType.INCOMING_PROCESS_MODULE_VIEW_REQUEST,
            this.internal_moduleViewRequestHandler
        );
    }

    public override componentWillUnmount():void {
        BridgeContextWrapper.removeEventListener(
            BridgeRequestType.INCOMING_PROCESS_MODULE_VIEW_REQUEST,
            this.internal_moduleViewRequestHandler
        );
    }

    public override render():React.ReactNode {
        return (
            <div className="module" />
        );
    }
}

export abstract class ModuleView<
    ModuleType = any, ModuleState = any
> extends AbstractModuleView<
    ModuleMethodsExtractor<ModuleType>, ModuleStateExtractor<ModuleType> & Partial<ModuleState>
> {
    // specifying Module type without internal methods/properties,
    // and auto-extracting inherited ModuleState type
}
