import { DBCore, DBCoreTable, Middleware } from 'dexie';
export type Operation = keyof DBCoreTable;
export interface LoggerProps {
    tableWhiteList?: string[];
    tablesBlackList?: string[];
    operationsWhiteList?: Operation[];
    operationsBlackList?: Operation[];
}
declare const loggerMiddleware: (props: LoggerProps) => Middleware<DBCore>;
export default loggerMiddleware;
