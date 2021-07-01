export type Class<Type extends abstract new (...args:any) => any> = {
    new(...args:ConstructorParameters<Type>):InstanceType<Type>;
};
