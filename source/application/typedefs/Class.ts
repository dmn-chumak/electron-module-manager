import { Vector } from './Vector';

export type Class<Type> = {
    new(...args:Vector<any>):Type;
};
