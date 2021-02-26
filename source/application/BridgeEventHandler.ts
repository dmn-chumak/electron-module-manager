import { Vector } from './typedefs/Vector';

export type BridgeEventHandler<ContentType> = ((content:ContentType) => void) & {
    nativeFunc?:(...content:Vector<any>) => void;
};
