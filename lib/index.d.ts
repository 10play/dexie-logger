import { DBCore, Middleware } from "dexie";
import { Operation } from "./loggers";
export interface LoggerProps {
    tableWhiteList?: string[];
    tablesBlackList?: string[];
    operationsWhiteList?: Operation[];
    operationsBlackList?: Operation[];
}
declare const dexieLogger: (props?: LoggerProps) => Middleware<DBCore>;
export default dexieLogger;
