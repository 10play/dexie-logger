import { DBCore, DBCoreTable, Middleware } from "dexie";
export type Operation = keyof DBCoreTable;
export interface LoggerProps {
    tableWhiteList?: string[];
    tablesBlackList?: string[];
    operationsWhiteList?: Operation[];
    operationsBlackList?: Operation[];
}
export declare const dexieLogger: (props: LoggerProps) => Middleware<DBCore>;
