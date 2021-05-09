import { Vector } from './declarations/Vector';

type BaseEventHandler = (...content:Vector<any>) => void;

export type BridgeEventHandler = BaseEventHandler & {
    nativeFunc?:BaseEventHandler;
};
