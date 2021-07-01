export type DictionaryKeys = number | string;

export type PropsDictionary<Type> = Pick<Type, keyof Type>;

export type Dictionary<Type> = {
    [Key in DictionaryKeys]:Type
};
