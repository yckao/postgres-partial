import { PartialSQL, Skip, SerializableParameterDynamic } from './types';
import { Sql, Row, PendingQuery } from 'postgres';
declare function partial(xs: TemplateStringsArray, ...args: SerializableParameterDynamic[]): PartialSQL;
export declare type SqlWithDynamic<T extends {
    [name: string]: unknown;
}> = Sql<T> & {
    skip: Skip;
    partial: typeof partial;
} & {
    <T extends Row | Row[] = Row>(template: TemplateStringsArray, ...args: SerializableParameterDynamic[]): PendingQuery<T extends Row[] ? T : T[]>;
};
export declare function wrap(sql: Sql<never>): SqlWithDynamic<never>;
export {};
