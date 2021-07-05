import * as JsonPatch from 'fast-json-patch';
import * as React from 'react';
import { BridgeContextWrapper } from '../bridge/BridgeContextWrapper';
import { BridgeRequestType } from '../bridge/BridgeRequestType';
import { Class } from '../Class';
import { Dictionary } from '../Dictionary';
import { PluginView } from '../plugins/PluginView';
import { ModuleOptions } from './ModuleOptions';
import { ModuleStateExtractor } from './ModuleTypeExtractors';
import { ModuleContext } from './ModuleTypeExtractors';

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

    private internal_moduleViewUpdateHandler = (moduleType:number, patch:JsonPatch.Operation[]) => {
        if (moduleType === this.props.moduleType) {
            const pathResult = JsonPatch.applyPatch(this.state, patch, false, false);
            this.setState(pathResult.newDocument);
        }
    };

    public override componentDidMount():void {
        BridgeContextWrapper.appendEventListener(
            BridgeRequestType.PROCESS_MODULE_VIEW_UPDATE,
            this.internal_moduleViewUpdateHandler
        );
    }

    public override componentWillUnmount():void {
        BridgeContextWrapper.removeEventListener(
            BridgeRequestType.PROCESS_MODULE_VIEW_UPDATE,
            this.internal_moduleViewUpdateHandler
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
    ModuleContext<ModuleType>, ModuleStateExtractor<ModuleType> & Partial<ModuleState>
> {
    // specifying Module type without internal methods/properties,
    // and auto-extracting inherited ModuleState type
}
