import { SerializableParameter } from 'postgres'
class DynamicSQL {
  public xs: TemplateStringsArray | string[]
  public params: SerializableParameterDynamic[]

  constructor(xs: TemplateStringsArray | string[] = [], params: SerializableParameterDynamic[] = []) {
    this.xs = xs
    this.params = params
  }
}
export class Skip extends DynamicSQL { }
export class PartialSQL extends DynamicSQL { }

export type SerializableParameterDynamic = SerializableParameter | Skip | PartialSQL
