
  /**
   * @license
   * author: Noam Golani <noam.golani@gmail.com>
   * dexie-logger.js v1.2.4
   * Released under the MIT license.
   */

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
var LogType;
(function (LogType) {
    LogType["Default"] = "DEFAULT";
    LogType["Minimal"] = "MINIMAL";
})(LogType || (LogType = {}));
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

export { LogType, dexieLogger as default, generateQueryRequestKey };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sb2dnZXJzL2RlZmF1bHQudHMiLCIuLi8uLi9zcmMvbG9nZ2Vycy9taW5pbWFsLnRzIiwiLi4vLi4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbbnVsbCxudWxsLG51bGxdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUVPLE1BQU0sdUJBQXVCLEdBQXFCO0lBQ3ZELE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLFNBQVMsRUFBRSxLQUFJO0FBQzdCLFFBQUEsT0FBTyxDQUFDLGNBQWMsQ0FBQyxXQUFXLFNBQVMsQ0FBQSxzQkFBQSxDQUF3QixDQUFDLENBQUM7QUFDckUsUUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QixRQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0MsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ25CLFFBQUEsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFJO0FBQzlCLFlBQUEsT0FBTyxDQUFDLGNBQWMsQ0FDcEIsQ0FBQSxRQUFBLEVBQVcsU0FBUyxDQUFnQixhQUFBLEVBQUEsV0FBVyxDQUFDLE9BQU8sQ0FDckQsQ0FBQyxDQUNGLENBQUEsZ0JBQUEsQ0FBa0IsQ0FDcEIsQ0FBQztZQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxHQUFHLFdBQVcsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUNuRCxZQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0MsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3JCLFNBQUMsQ0FBQztLQUNIO0lBQ0QsR0FB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
