
  /**
   * @license
   * author: Noam Golani <noam.golani@gmail.com>
   * dexie-logger.js v1.2.4
   * Released under the MIT license.
   */

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const defaultLoggingCallbacks = {
    mutate: (req, { tableName }) => {
        console.groupCollapsed(`Dexie | ${tableName} [ Mutate ] => Request`);
        console.log(req.type);
        console.log(JSON.stringify(req, undefined, 2));
        console.groupEnd();
        return (res, { timeElapsed }) => {
            console.groupCollapsed(`Dexie | ${tableName} [ Mutate ] (${timeElapsed.toFixed(1)} ms) <= Response`);
            console.log("-> Duration: " + timeElapsed + " ms");
            console.log(JSON.stringify(res, undefined, 2));
            console.groupEnd();
        };
    },
    get: (req, { tableName }) => {
        console.groupCollapsed(`Dexie | ${tableName} [ Get ] => Request`);
        console.log(req.key);
        console.log(JSON.stringify(req, undefined, 2));
        console.groupEnd();
        return (res, { timeElapsed }) => {
            console.groupCollapsed(`Dexie | ${tableName} [ Get ] (${timeElapsed.toFixed(1)} ms) <= Response`);
            console.log("-> Duration: " + timeElapsed + " ms");
            console.log(JSON.stringify(res, undefined, 2));
            console.groupEnd();
        };
    },
    getMany: (req, { tableName }) => {
        console.groupCollapsed(`Dexie | ${tableName} [ Get Many ] => Request`);
        console.log(req.keys);
        console.log(JSON.stringify(req, undefined, 2));
        console.groupEnd();
        return (res, { timeElapsed }) => {
            console.groupCollapsed(`Dexie | ${tableName} [ Get Many ] (${timeElapsed.toFixed(1)} ms) <= Response`);
            console.log("-> Duration: " + timeElapsed + " ms");
            console.log(JSON.stringify(res, undefined, 2));
            console.groupEnd();
        };
    },
    query: (req, { tableName }) => {
        console.groupCollapsed(`Dexie | ${tableName}  [ Query ] => Request`);
        console.log(req.query);
        console.log(req);
        console.groupEnd();
        return (res, { timeElapsed }) => {
            console.groupCollapsed(`Dexie | ${tableName}  [ Query ] (${timeElapsed.toFixed(1)} ms) <= Response`);
            console.log("-> Duration: " + timeElapsed + " ms");
            console.log(res);
            console.groupEnd();
        };
    },
    openCursor: (req, { tableName }) => {
        console.groupCollapsed(`Dexie | ${tableName} [ Open Cursor ] => Request`);
        console.log(`Dexie | Open Cursor | ${JSON.stringify(req.query, undefined, 2)}, ${tableName} - `);
        console.groupEnd();
        return (res, { timeElapsed }) => {
            console.groupCollapsed(`Dexie | ${tableName} [ Open Cursor ] (${timeElapsed.toFixed(1)} ms) <= Response`);
            console.log("-> Duration: " + timeElapsed + " ms");
            console.log(JSON.stringify(res, undefined, 2));
            console.groupEnd();
        };
    },
    count: (req, { tableName }) => {
        console.groupCollapsed(`Dexie | ${tableName} [ Count ] => Request`);
        console.log(req.query);
        console.log(req);
        console.groupEnd();
        return (res, { timeElapsed }) => {
            console.groupCollapsed(`Dexie | ${tableName} [ Count ] (${timeElapsed.toFixed(1)} ms) <= Response`);
            console.log("-> Duration: " + timeElapsed + " ms");
            console.log(res);
            console.groupEnd();
        };
    },
};

const minimalLoggingCallbacks = {
    mutate: (req, { tableName }) => {
        return (_res, { timeElapsed }) => {
            console.log(`Dexie | ${tableName} [ Mutate - ${req.type} ] (${timeElapsed.toFixed(2)} ms)`);
        };
    },
    get: (req, { tableName }) => {
        return (_res, { timeElapsed }) => {
            console.log(`Dexie | ${tableName} [ Get - ${req.key} ] (${timeElapsed.toFixed(2)} ms)`);
        };
    },
    getMany: (_req, { tableName }) => {
        return (_res, { timeElapsed }) => {
            console.log(`Dexie | ${tableName} [ Get Many ] (${timeElapsed.toFixed(2)} ms)`);
        };
    },
    query: (req, { tableName }) => {
        return (_res, { timeElapsed }) => {
            console.log(`Dexie | ${tableName} [ Query -  ${generateQueryRequestKey(req.query)} ] (${timeElapsed.toFixed(2)} ms)`);
        };
    },
    openCursor: (req, { tableName }) => {
        return (_res, { timeElapsed }) => {
            console.log(`Dexie | ${tableName} [ Open Cursor -  ${generateQueryRequestKey(req.query)} ] (${timeElapsed.toFixed(2)} ms)`);
        };
    },
    count: (req, { tableName }) => {
        return (_res, { timeElapsed }) => {
            console.log(`Dexie | ${tableName} [ Count -  ${generateQueryRequestKey(req.query)} ] (${timeElapsed.toFixed(2)} ms)`);
        };
    },
};

// import { useDevtools } from "./devtools/devtools";
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
const generateQueryRequestKey = (query) => {
    return `query:[${query.index ? query.index.name || "primary" : "primary"},range:${generateRangeKey(query.range)}]`;
};
exports.LogType = void 0;
(function (LogType) {
    LogType["Default"] = "DEFAULT";
    LogType["Minimal"] = "MINIMAL";
})(exports.LogType || (exports.LogType = {}));
const DEFAULT_PROPS = {
    logType: exports.LogType.Default,
};
const loggersCallbacksFromLogType = (logType) => {
    switch (logType) {
        case exports.LogType.Minimal:
            return minimalLoggingCallbacks;
        case exports.LogType.Default:
        default:
            return defaultLoggingCallbacks;
    }
};
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

exports.default = dexieLogger;
exports.generateQueryRequestKey = generateQueryRequestKey;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sb2dnZXJzL2RlZmF1bHQudHMiLCIuLi8uLi9zcmMvbG9nZ2Vycy9taW5pbWFsLnRzIiwiLi4vLi4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbbnVsbCxudWxsLG51bGxdLCJuYW1lcyI6WyJMb2dUeXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFFTyxNQUFNLHVCQUF1QixHQUFxQjtJQUN2RCxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxTQUFTLEVBQUUsS0FBSTtBQUM3QixRQUFBLE9BQU8sQ0FBQyxjQUFjLENBQUMsV0FBVyxTQUFTLENBQUEsc0JBQUEsQ0FBd0IsQ0FBQyxDQUFDO0FBQ3JFLFFBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEIsUUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9DLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNuQixRQUFBLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxXQUFXLEVBQUUsS0FBSTtBQUM5QixZQUFBLE9BQU8sQ0FBQyxjQUFjLENBQ3BCLENBQUEsUUFBQSxFQUFXLFNBQVMsQ0FBZ0IsYUFBQSxFQUFBLFdBQVcsQ0FBQyxPQUFPLENBQ3JELENBQUMsQ0FDRixDQUFBLGdCQUFBLENBQWtCLENBQ3BCLENBQUM7WUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsR0FBRyxXQUFXLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDbkQsWUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNyQixTQUFDLENBQUM7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
