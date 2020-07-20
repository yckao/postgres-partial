import { PartialSQL, Skip, SerializableParameterDynamic } from './types'
import { Sql, SerializableParameter, Row, PendingQuery, Helper, TransactionSql } from 'postgres'
import { isString } from 'util';

interface JSToPostgresTypeMap {
  [name: string]: unknown;
}

type UnwrapPromiseArray<T> = T extends any[] ? {
  [k in keyof T]: T[k] extends Promise<infer R> ? R : T[k]
} : T;

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

export type TransactionSqlWithDynamic<TTypes extends JSToPostgresTypeMap> = {
  savepoint<T>(cb: (sql: TransactionSqlWithDynamic<TTypes>) => T | Promise<T>): Promise<UnwrapPromiseArray<T>>;
  savepoint<T>(name: string, cb: (sql: TransactionSqlWithDynamic<TTypes>) => T | Promise<T>): Promise<UnwrapPromiseArray<T>>;
} &
  TransactionSql<TTypes> & {
    skip: Skip
    partial: typeof partial
  } & {
    <T extends Row | Row[] = Row>(template: TemplateStringsArray, ...args: SerializableParameterDynamic[]): PendingQuery<T extends Row[] ? T : T[]>;
  }

export type SqlWithDynamic<TTypes extends JSToPostgresTypeMap> = {
  begin<T>(cb: (sql: TransactionSqlWithDynamic<TTypes>) => T | Promise<T>): Promise<UnwrapPromiseArray<T>>;
  begin<T>(options: string, cb: (sql: TransactionSqlWithDynamic<TTypes>) => T | Promise<T>): Promise<UnwrapPromiseArray<T>>;
} & Sql<TTypes> & {
  skip: Skip
  partial: typeof partial
} & {
  <T extends Row | Row[] = Row>(template: TemplateStringsArray, ...args: SerializableParameterDynamic[]): PendingQuery<T extends Row[] ? T : T[]>;
}

function isTemplateStringArray(strs: TemplateStringsArray | string[] | string): strs is TemplateStringsArray {
  return Array.isArray((strs as TemplateStringsArray).raw) && Array.isArray(strs)
}

export function wrap<TTypes extends JSToPostgresTypeMap>(sql: Sql<TTypes>): SqlWithDynamic<TTypes> {
  // TODO: Use Actual Type For Helper
  function query<T>(strs: TemplateStringsArray | string, ...params: SerializableParameterDynamic[] | string[]): PendingQuery<T extends Row[] ? T : T[]> | Helper<string> {
    if (!isTemplateStringArray(strs)) {
      return sql(strs, ...Array.from(arguments).slice(1))
    }

    const { strs: _strs, params: _params } = parse(strs, ...params)
    const tsa = Object.assign(_strs, { raw: _strs.slice() }) as TemplateStringsArray

    return sql<T>(tsa, ..._params as SerializableParameter[])
  }

  function wrapper<T>(cb: ((sql: TransactionSqlWithDynamic<TTypes>) => T | Promise<T>)) {
    return function (sql: TransactionSql<TTypes>): T | Promise<T> {
      function savepoint(cb: (sql: TransactionSqlWithDynamic<TTypes>) => T | Promise<T>): Promise<UnwrapPromiseArray<T>>;
      function savepoint(name: string, cb: (sql: TransactionSqlWithDynamic<TTypes>) => T | Promise<T>): Promise<UnwrapPromiseArray<T>>;
      function savepoint(name: string | ((sql: TransactionSqlWithDynamic<TTypes>) => T | Promise<T>), cb?: (sql: TransactionSqlWithDynamic<TTypes>) => T | Promise<T>): Promise<UnwrapPromiseArray<T>> {
        if (isString(name)) {
          return sql.savepoint<T>(name, wrapper(cb!))
        } else {
          return sql.savepoint<T>(wrapper(name))
        }
      }
      return cb!(Object.assign(query, sql, { partial, skip, savepoint }) as TransactionSqlWithDynamic<TTypes>)
    }
  }

  function begin<T>(cb: (sql: TransactionSqlWithDynamic<TTypes>) => T | Promise<T>): Promise<UnwrapPromiseArray<T>>;
  function begin<T>(options: string, cb: (sql: TransactionSqlWithDynamic<TTypes>) => T | Promise<T>): Promise<UnwrapPromiseArray<T>>;
  function begin<T>(options: string | ((sql: TransactionSqlWithDynamic<TTypes>) => T | Promise<T>), cb?: (sql: TransactionSqlWithDynamic<TTypes>) => T | Promise<T>): Promise<UnwrapPromiseArray<T>> {
    if (!cb) {
      cb = options as (sql: TransactionSqlWithDynamic<TTypes>) => T | Promise<T>
      options = ''
    }

    return sql.begin(options as string, wrapper(cb))
  }

  const skip = new Skip()

  return Object.assign(query, sql, { partial, skip, begin }) as SqlWithDynamic<TTypes>
}
