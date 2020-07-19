import { SerializableParameter } from 'postgres';
declare class DynamicSQL {
    xs: TemplateStringsArray | string[];
    params: SerializableParameterDynamic[];
    constructor(xs?: TemplateStringsArray | string[], params?: SerializableParameterDynamic[]);
}
export declare class Skip extends DynamicSQL {
}
export declare class PartialSQL extends DynamicSQL {
}
export declare type SerializableParameterDynamic = SerializableParameter | Skip | PartialSQL;
export {};
