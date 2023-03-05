// import { useDevtools } from "./devtools/devtools";
import { defaultLoggingCallbacks, minimalLoggingCallbacks, } from "./loggers";
const RANGE_TYPES = [, "equal", "range", "any", "never"];
const generateRangeKey = (range) => {
    switch (RANGE_TYPES[range.type]) {
        case "equal":
            return `equal`;
        case "range":
            return `${range.lowerOpen ? "(" : "["}${JSON.stringify(range.lower)}:${JSON.stringify(range.upper)}${range.upperOpen ? ")" : "]"}`;
        case "any":
            return `any`;
        case "never":
        default:
            return "never";
    }
};
export const generateQueryRequestKey = (query) => {
    return `query:[${query.index ? query.index.name || "primary" : "primary"},range:${generateRangeKey(query.range)}]`;
};
const generateMutateKey = (tableName, req) => {
    let typeSpecificKey = "";
    switch (req.type) {
        case "add":
            typeSpecificKey = "";
            break;
        case "put":
            if (req.changeSpec)
                typeSpecificKey = `fields:${Object.keys(req.changeSpec).join(",")}`;
            else if (req.changeSpecs)
                typeSpecificKey = `fields:${req.changeSpecs
                    .map((changeSpec) => Object.keys(changeSpec).join(","))
                    .join(",")}`;
            else if (req.criteria)
                typeSpecificKey = JSON.stringify(req.criteria);
            else if (req.keys)
                typeSpecificKey = "byKeys";
            break;
        case "delete":
            typeSpecificKey = req.criteria ? JSON.stringify(req.criteria) : "byKeys";
            break;
        case "deleteRange":
            typeSpecificKey = req.range ? generateRangeKey(req.range) : "all";
            break;
    }
    return `[${tableName},mutate,${req.type},${typeSpecificKey}]`;
};
const generateGetKey = (tableName) => `[${tableName},get,byKey]`;
const generateGetManyKey = (tableName, req) => `[${tableName},getMany,byKeys${req.cache ? `,${req.cache}` : ""}]`;
const generateOpenCursorKey = (tableName, req) => `[${tableName},openCursor${req.reverse ? ",reverse" : ""},${generateQueryRequestKey(req.query)}]`;
const generateQueryKey = (tableName, req) => `[${tableName},query,${generateQueryRequestKey(req.query)}]`;
const generateCountKey = (tableName, req) => `[${tableName},count,${generateQueryRequestKey(req.query)}]`;
export var LogType;
(function (LogType) {
    LogType["Default"] = "DEFAULT";
    LogType["Minimal"] = "MINIMAL";
})(LogType || (LogType = {}));
const handleTransactions = (transaction, key) => {
    const exists = transactions.has(transaction);
    const startTime = performance.now();
    if (!exists) {
        transactions.set(transaction, [key]);
        transaction.addEventListener("complete", () => {
            const timeElapsed = performance.now() - startTime;
            console.log(`Ended transaction (${timeElapsed.toFixed(1)})`, transactions.get(transaction));
            transactions.delete(transaction);
        });
    }
    else
        transactions.get(transaction).push(key);
};
const DEFAULT_PROPS = {
    logType: LogType.Default,
};
const loggersCallbacksFromLogType = (logType) => {
    switch (logType) {
        case LogType.Minimal:
            return minimalLoggingCallbacks;
        case LogType.Default:
        default:
            return defaultLoggingCallbacks;
    }
};
const transactions = new Map();
const dexieLogger = (loggerProps) => {
    const { tableWhiteList, tablesBlackList, operationsBlackList, operationsWhiteList, logType, } = { ...DEFAULT_PROPS, ...loggerProps };
    // useDevtools();
    if (tableWhiteList && tablesBlackList)
        throw Error("You can't use both tableWhiteList and tablesBlackList at the same time");
    if (operationsWhiteList && operationsBlackList)
        throw Error("You can't use both operationsWhiteList and operationsBlackList at the same time");
    const shouldLog = (tableName, operation) => {
        let shouldLogOperation = false;
        if (operationsWhiteList)
            shouldLogOperation = operationsWhiteList.includes(operation);
        else if (operationsBlackList)
            shouldLogOperation = !operationsBlackList.includes(operation);
        else
            shouldLogOperation = true;
        let shouldLogTable = false;
        if (tableWhiteList)
            shouldLogTable = tableWhiteList.includes(tableName);
        else if (tablesBlackList)
            shouldLogTable = !tablesBlackList.includes(tableName);
        else
            shouldLogTable = true;
        return shouldLogOperation && shouldLogTable;
    };
    const callbacks = loggersCallbacksFromLogType(logType);
    return {
        stack: "dbcore",
        name: "logger",
        create(downlevelDatabase) {
            return {
                ...downlevelDatabase,
                table(tableName) {
                    const downlevelTable = downlevelDatabase.table(tableName);
                    return {
                        ...downlevelTable,
                        mutate: async (req) => {
                            const startTime = performance.now();
                            // const key = generateMutateKey(tableName, req);
                            // const transaction = req.trans;
                            // handleTransactions(transaction, key);
                            // Log the request
                            let responseLogger;
                            if (shouldLog(tableName, "mutate"))
                                responseLogger = callbacks["mutate"]?.(req, {
                                    tableName,
                                });
                            return downlevelTable.mutate(req).then((res) => {
                                const timeElapsed = performance.now() - startTime;
                                // Log the response
                                if (shouldLog(tableName, "mutate"))
                                    responseLogger?.(res, {
                                        timeElapsed,
                                    });
                                return res;
                            });
                        },
                        get: async (req) => {
                            const startTime = performance.now();
                            // const key = generateGetKey(tableName);
                            // const transaction = req.trans;
                            // handleTransactions(transaction, key);
                            // Log the request
                            let responseLogger;
                            if (shouldLog(tableName, "get"))
                                responseLogger = callbacks["get"]?.(req, {
                                    tableName,
                                });
                            return downlevelTable.get(req).then((res) => {
                                const timeElapsed = performance.now() - startTime;
                                // Log the response
                                if (shouldLog(tableName, "get"))
                                    responseLogger?.(res, {
                                        timeElapsed,
                                    });
                                return res;
                            });
                        },
                        getMany: async (req) => {
                            const startTime = performance.now();
                            // const key = generateGetManyKey(tableName, req);
                            // const transaction = req.trans;
                            // handleTransactions(transaction, key);
                            // Log the request
                            let responseLogger;
                            if (shouldLog(tableName, "getMany"))
                                responseLogger = callbacks["getMany"]?.(req, {
                                    tableName,
                                });
                            return downlevelTable.getMany(req).then((res) => {
                                const timeElapsed = performance.now() - startTime;
                                // Log the response
                                if (shouldLog(tableName, "getMany"))
                                    responseLogger?.(res, {
                                        timeElapsed,
                                    });
                                return res;
                            });
                        },
                        query: async (req) => {
                            const startTime = performance.now();
                            // const key = generateQueryKey(tableName, req);
                            // const transaction = req.trans;
                            // handleTransactions(transaction, key);
                            // Log the request
                            let responseLogger;
                            if (shouldLog(tableName, "query"))
                                responseLogger = callbacks["query"]?.(req, {
                                    tableName,
                                });
                            return downlevelTable.query(req).then((res) => {
                                const timeElapsed = performance.now() - startTime;
                                // Log the response
                                if (shouldLog(tableName, "query"))
                                    responseLogger?.(res, {
                                        timeElapsed,
                                    });
                                return res;
                            });
                        },
                        openCursor: async (req) => {
                            const startTime = performance.now();
                            // const key = generateOpenCursorKey(tableName, req);
                            // const transaction = req.trans;
                            // handleTransactions(transaction, key);
                            // Log the request
                            let responseLogger;
                            if (shouldLog(tableName, "openCursor"))
                                responseLogger = callbacks["openCursor"]?.(req, {
                                    tableName,
                                });
                            return downlevelTable.openCursor(req).then((res) => {
                                const timeElapsed = performance.now() - startTime;
                                // Log the response
                                if (shouldLog(tableName, "openCursor"))
                                    responseLogger?.(res, {
                                        timeElapsed,
                                    });
                                return res;
                            });
                        },
                        count: async (req) => {
                            const startTime = performance.now();
                            // const key = generateCountKey(tableName, req);
                            // const transaction = req.trans;
                            // handleTransactions(transaction, key);
                            // Log the request
                            let responseLogger;
                            if (shouldLog(tableName, "count"))
                                responseLogger = callbacks["count"]?.(req, {
                                    tableName,
                                });
                            return downlevelTable.count(req).then((res) => {
                                const timeElapsed = performance.now() - startTime;
                                // Log the response
                                if (shouldLog(tableName, "count"))
                                    responseLogger?.(res, {
                                        timeElapsed,
                                    });
                                return res;
                            });
                        },
                    };
                },
            };
        },
    };
};
export default dexieLogger;
