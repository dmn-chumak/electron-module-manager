export type DictionaryKeys = number | string;
export type Dictionary<Type> = { [K in DictionaryKeys]:Type };
