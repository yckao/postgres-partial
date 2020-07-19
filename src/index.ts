import { PartialSQL, Skip, SerializableParameterDynamic } from './types'
import { Sql, SerializableParameter, Row, PendingQuery, Helper, HelperSerializable } from 'postgres'

function partial(xs: TemplateStringsArray, ...args: SerializableParameterDynamic[]) {
  return new PartialSQL(xs, args)
}

function parseParam(strs: string[], params: SerializableParameterDynamic[], next: string, param: SerializableParameterDynamic) {
  const prev = strs[strs.length - 1]

  if (param instanceof Skip) {
    strs[strs.length - 1] = prev.trimRight() + next

    return {
      strs,
      params
    }
  }

  if (param instanceof PartialSQL) {
    const { strs: _strs, params: _params } = parse(param.xs, ...param.params)
    _strs[_strs.length - 1] += next

    strs[strs.length - 1] += _strs[0]

    strs.push(..._strs.slice(1))
    params.push(..._params)

    return {
      strs,
      params
    }
  }

  strs.push(next)
  params.push(param)

  return {
    strs,
    params
  }
}


function parse(strs: string[] | TemplateStringsArray, ...params: SerializableParameterDynamic[]) {
  let _strs = [strs[0].toString()]
  let _params = [] as SerializableParameterDynamic[]

  for (let i = 0; i < params.length; i++) {
    ({ strs: _strs, params: _params } = parseParam(
      _strs,
      _params,
      strs[i + 1].toString(),
      params[i]
    ))
  }

  return {
    strs: _strs,
    params: _params
  }
}

export type SqlWithDynamic<T extends { [name: string]: unknown }> = Sql<T> & {
  skip: Skip
  partial: typeof partial
} & {
  <T extends Row | Row[] = Row>(template: TemplateStringsArray, ...args: SerializableParameterDynamic[]): PendingQuery<T extends Row[] ? T : T[]>;
}

function isTemplateStringArray(strs: TemplateStringsArray | string[] | string): strs is TemplateStringsArray {
  return Array.isArray((strs as TemplateStringsArray).raw) && Array.isArray(strs)
}

export function wrap(sql: Sql<never>): SqlWithDynamic<never> {
  // TODO: Use Actual Type For Helper
  function wrapper<T>(strs: TemplateStringsArray | string, ...params: SerializableParameterDynamic[] | string[]): PendingQuery<T extends Row[] ? T : T[]> | Helper<string> {
    if (!isTemplateStringArray(strs)) {
      return sql(strs, ...Array.from(arguments).slice(1))
    }

    const { strs: _strs, params: _params } = parse(strs, ...params)
    const tsa = Object.assign(_strs, { raw: _strs.slice() }) as TemplateStringsArray

    return sql<T>(tsa, ..._params as SerializableParameter[])
  }

  const skip = new Skip()

  return Object.assign(wrapper, sql, { partial, skip }) as SqlWithDynamic<never>
}
