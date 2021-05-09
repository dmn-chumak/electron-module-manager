import { Vector } from './Vector';

export type Class<Type, ArgsType extends Vector<any> = Vector<any>> = {
    new(...args:ArgsType):Type;
};
