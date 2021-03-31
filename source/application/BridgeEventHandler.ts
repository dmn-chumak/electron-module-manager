import { Vector } from './typedefs/Vector';

export type BridgeEventHandler = ((...content:Vector<any>) => void) & {
    nativeFunc?:(...content:Vector<any>) => void;
};
