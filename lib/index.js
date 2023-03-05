
  /**
   * @license
   * author: Noam Golani <noam.golani@gmail.com>
   * dexie-logger.js v1.2.4
   * Released under the MIT license.
   */

(function (exports) {
    'use strict';

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

    Object.defineProperty(exports, '__esModule', { value: true });

})(this["dexie-logger"] = this["dexie-logger"] || {});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2dnZXJzL2RlZmF1bHQudHMiLCIuLi9zcmMvbG9nZ2Vycy9taW5pbWFsLnRzIiwiLi4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbbnVsbCxudWxsLG51bGxdLCJuYW1lcyI6WyJMb2dUeXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUVPLE1BQU0sdUJBQXVCLEdBQXFCO1FBQ3ZELE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLFNBQVMsRUFBRSxLQUFJO0lBQzdCLFFBQUEsT0FBTyxDQUFDLGNBQWMsQ0FBQyxXQUFXLFNBQVMsQ0FBQSxzQkFBQSxDQUF3QixDQUFDLENBQUM7SUFDckUsUUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0QixRQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0MsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ25CLFFBQUEsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFJO0lBQzlCLFlBQUEsT0FBTyxDQUFDLGNBQWMsQ0FDcEIsQ0FBQSxRQUFBLEVBQVcsU0FBUyxDQUFnQixhQUFBLEVBQUEsV0FBVyxDQUFDLE9BQU8sQ0FDckQsQ0FBQyxDQUNGLENBQUEsZ0JBQUEsQ0FBa0IsQ0FDcEIsQ0FBQztnQkFDRixPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsR0FBRyxXQUFXLEdBQUcsS0FBSyxDQUFDLENBQUM7SUFDbkQsWUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDckIsU0FBQyxDQUFDO1NBQ0g7UUFD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
