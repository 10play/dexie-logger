import { DBCore, DBCoreQuery, Middleware } from "dexie";
import { Operation } from "./loggers";
export declare const generateQueryRequestKey: (query: DBCoreQuery) => string;
export declare enum LogType {
    Default = "DEFAULT",
    Minimal = "MINIMAL"
}
export interface LoggerProps {
    tableWhiteList?: string[];
    tablesBlackList?: string[];
    operationsWhiteList?: Operation[];
    operationsBlackList?: Operation[];
    logType: LogType;
}
declare const dexieLogger: (props?: Partial<LoggerProps>) => Middleware<DBCore>;
export default dexieLogger;
