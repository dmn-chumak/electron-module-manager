export type DictionaryKeys = number | string;
export type Dictionary<Type> = { [Key in DictionaryKeys]:Type };
