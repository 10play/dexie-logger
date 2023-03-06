
  /**
   * @license
   * author: Noam Golani <noam.golani@gmail.com>
   * dexie-logger.js v1.2.6
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sb2dnZXJzL2RlZmF1bHQudHMiLCIuLi8uLi9zcmMvbG9nZ2Vycy9taW5pbWFsLnRzIiwiLi4vLi4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExvZ2dpbmdDYWxsYmFja3MgfSBmcm9tIFwiLlwiO1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdExvZ2dpbmdDYWxsYmFja3M6IExvZ2dpbmdDYWxsYmFja3MgPSB7XG4gIG11dGF0ZTogKHJlcSwgeyB0YWJsZU5hbWUgfSkgPT4ge1xuICAgIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoYERleGllIHwgJHt0YWJsZU5hbWV9IFsgTXV0YXRlIF0gPT4gUmVxdWVzdGApO1xuICAgIGNvbnNvbGUubG9nKHJlcS50eXBlKTtcbiAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShyZXEsIHVuZGVmaW5lZCwgMikpO1xuICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICByZXR1cm4gKHJlcywgeyB0aW1lRWxhcHNlZCB9KSA9PiB7XG4gICAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKFxuICAgICAgICBgRGV4aWUgfCAke3RhYmxlTmFtZX0gWyBNdXRhdGUgXSAoJHt0aW1lRWxhcHNlZC50b0ZpeGVkKFxuICAgICAgICAgIDFcbiAgICAgICAgKX0gbXMpIDw9IFJlc3BvbnNlYFxuICAgICAgKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiLT4gRHVyYXRpb246IFwiICsgdGltZUVsYXBzZWQgKyBcIiBtc1wiKTtcbiAgICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHJlcywgdW5kZWZpbmVkLCAyKSk7XG4gICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgfTtcbiAgfSxcbiAgZ2V0OiAocmVxLCB7IHRhYmxlTmFtZSB9KSA9PiB7XG4gICAgY29uc29sZS5ncm91cENvbGxhcHNlZChgRGV4aWUgfCAke3RhYmxlTmFtZX0gWyBHZXQgXSA9PiBSZXF1ZXN0YCk7XG4gICAgY29uc29sZS5sb2cocmVxLmtleSk7XG4gICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkocmVxLCB1bmRlZmluZWQsIDIpKTtcbiAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgcmV0dXJuIChyZXMsIHsgdGltZUVsYXBzZWQgfSkgPT4ge1xuICAgICAgY29uc29sZS5ncm91cENvbGxhcHNlZChcbiAgICAgICAgYERleGllIHwgJHt0YWJsZU5hbWV9IFsgR2V0IF0gKCR7dGltZUVsYXBzZWQudG9GaXhlZChcbiAgICAgICAgICAxXG4gICAgICAgICl9IG1zKSA8PSBSZXNwb25zZWBcbiAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZyhcIi0+IER1cmF0aW9uOiBcIiArIHRpbWVFbGFwc2VkICsgXCIgbXNcIik7XG4gICAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShyZXMsIHVuZGVmaW5lZCwgMikpO1xuICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgIH07XG4gIH0sXG4gIGdldE1hbnk6IChyZXEsIHsgdGFibGVOYW1lIH0pID0+IHtcbiAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKGBEZXhpZSB8ICR7dGFibGVOYW1lfSBbIEdldCBNYW55IF0gPT4gUmVxdWVzdGApO1xuICAgIGNvbnNvbGUubG9nKHJlcS5rZXlzKTtcbiAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShyZXEsIHVuZGVmaW5lZCwgMikpO1xuICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICByZXR1cm4gKHJlcywgeyB0aW1lRWxhcHNlZCB9KSA9PiB7XG4gICAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKFxuICAgICAgICBgRGV4aWUgfCAke3RhYmxlTmFtZX0gWyBHZXQgTWFueSBdICgke3RpbWVFbGFwc2VkLnRvRml4ZWQoXG4gICAgICAgICAgMVxuICAgICAgICApfSBtcykgPD0gUmVzcG9uc2VgXG4gICAgICApO1xuICAgICAgY29uc29sZS5sb2coXCItPiBEdXJhdGlvbjogXCIgKyB0aW1lRWxhcHNlZCArIFwiIG1zXCIpO1xuICAgICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkocmVzLCB1bmRlZmluZWQsIDIpKTtcbiAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICB9O1xuICB9LFxuICBxdWVyeTogKHJlcSwgeyB0YWJsZU5hbWUgfSkgPT4ge1xuICAgIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoYERleGllIHwgJHt0YWJsZU5hbWV9ICBbIFF1ZXJ5IF0gPT4gUmVxdWVzdGApO1xuICAgIGNvbnNvbGUubG9nKHJlcS5xdWVyeSk7XG4gICAgY29uc29sZS5sb2cocmVxKTtcbiAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgcmV0dXJuIChyZXMsIHsgdGltZUVsYXBzZWQgfSkgPT4ge1xuICAgICAgY29uc29sZS5ncm91cENvbGxhcHNlZChcbiAgICAgICAgYERleGllIHwgJHt0YWJsZU5hbWV9ICBbIFF1ZXJ5IF0gKCR7dGltZUVsYXBzZWQudG9GaXhlZChcbiAgICAgICAgICAxXG4gICAgICAgICl9IG1zKSA8PSBSZXNwb25zZWBcbiAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZyhcIi0+IER1cmF0aW9uOiBcIiArIHRpbWVFbGFwc2VkICsgXCIgbXNcIik7XG4gICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgIH07XG4gIH0sXG4gIG9wZW5DdXJzb3I6IChyZXEsIHsgdGFibGVOYW1lIH0pID0+IHtcbiAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKGBEZXhpZSB8ICR7dGFibGVOYW1lfSBbIE9wZW4gQ3Vyc29yIF0gPT4gUmVxdWVzdGApO1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgYERleGllIHwgT3BlbiBDdXJzb3IgfCAke0pTT04uc3RyaW5naWZ5KFxuICAgICAgICByZXEucXVlcnksXG4gICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgMlxuICAgICAgKX0sICR7dGFibGVOYW1lfSAtIGBcbiAgICApO1xuICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICByZXR1cm4gKHJlcywgeyB0aW1lRWxhcHNlZCB9KSA9PiB7XG4gICAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKFxuICAgICAgICBgRGV4aWUgfCAke3RhYmxlTmFtZX0gWyBPcGVuIEN1cnNvciBdICgke3RpbWVFbGFwc2VkLnRvRml4ZWQoXG4gICAgICAgICAgMVxuICAgICAgICApfSBtcykgPD0gUmVzcG9uc2VgXG4gICAgICApO1xuICAgICAgY29uc29sZS5sb2coXCItPiBEdXJhdGlvbjogXCIgKyB0aW1lRWxhcHNlZCArIFwiIG1zXCIpO1xuICAgICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkocmVzLCB1bmRlZmluZWQsIDIpKTtcbiAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICB9O1xuICB9LFxuICBjb3VudDogKHJlcSwgeyB0YWJsZU5hbWUgfSkgPT4ge1xuICAgIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoYERleGllIHwgJHt0YWJsZU5hbWV9IFsgQ291bnQgXSA9PiBSZXF1ZXN0YCk7XG4gICAgY29uc29sZS5sb2cocmVxLnF1ZXJ5KTtcbiAgICBjb25zb2xlLmxvZyhyZXEpO1xuICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICByZXR1cm4gKHJlcywgeyB0aW1lRWxhcHNlZCB9KSA9PiB7XG4gICAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKFxuICAgICAgICBgRGV4aWUgfCAke3RhYmxlTmFtZX0gWyBDb3VudCBdICgke3RpbWVFbGFwc2VkLnRvRml4ZWQoXG4gICAgICAgICAgMVxuICAgICAgICApfSBtcykgPD0gUmVzcG9uc2VgXG4gICAgICApO1xuICAgICAgY29uc29sZS5sb2coXCItPiBEdXJhdGlvbjogXCIgKyB0aW1lRWxhcHNlZCArIFwiIG1zXCIpO1xuICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICB9O1xuICB9LFxufTtcbiIsImltcG9ydCB7IExvZ2dpbmdDYWxsYmFja3MgfSBmcm9tIFwiLlwiO1xuaW1wb3J0IHsgZ2VuZXJhdGVRdWVyeVJlcXVlc3RLZXkgfSBmcm9tIFwiLi5cIjtcblxuZXhwb3J0IGNvbnN0IG1pbmltYWxMb2dnaW5nQ2FsbGJhY2tzOiBMb2dnaW5nQ2FsbGJhY2tzID0ge1xuICBtdXRhdGU6IChyZXEsIHsgdGFibGVOYW1lIH0pID0+IHtcbiAgICByZXR1cm4gKF9yZXMsIHsgdGltZUVsYXBzZWQgfSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIGBEZXhpZSB8ICR7dGFibGVOYW1lfSBbIE11dGF0ZSAtICR7cmVxLnR5cGV9IF0gKCR7dGltZUVsYXBzZWQudG9GaXhlZChcbiAgICAgICAgICAyXG4gICAgICAgICl9IG1zKWBcbiAgICAgICk7XG4gICAgfTtcbiAgfSxcbiAgZ2V0OiAocmVxLCB7IHRhYmxlTmFtZSB9KSA9PiB7XG4gICAgcmV0dXJuIChfcmVzLCB7IHRpbWVFbGFwc2VkIH0pID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBgRGV4aWUgfCAke3RhYmxlTmFtZX0gWyBHZXQgLSAke3JlcS5rZXl9IF0gKCR7dGltZUVsYXBzZWQudG9GaXhlZChcbiAgICAgICAgICAyXG4gICAgICAgICl9IG1zKWBcbiAgICAgICk7XG4gICAgfTtcbiAgfSxcbiAgZ2V0TWFueTogKF9yZXEsIHsgdGFibGVOYW1lIH0pID0+IHtcbiAgICByZXR1cm4gKF9yZXMsIHsgdGltZUVsYXBzZWQgfSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIGBEZXhpZSB8ICR7dGFibGVOYW1lfSBbIEdldCBNYW55IF0gKCR7dGltZUVsYXBzZWQudG9GaXhlZCgyKX0gbXMpYFxuICAgICAgKTtcbiAgICB9O1xuICB9LFxuICBxdWVyeTogKHJlcSwgeyB0YWJsZU5hbWUgfSkgPT4ge1xuICAgIHJldHVybiAoX3JlcywgeyB0aW1lRWxhcHNlZCB9KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgYERleGllIHwgJHt0YWJsZU5hbWV9IFsgUXVlcnkgLSAgJHtnZW5lcmF0ZVF1ZXJ5UmVxdWVzdEtleShcbiAgICAgICAgICByZXEucXVlcnlcbiAgICAgICAgKX0gXSAoJHt0aW1lRWxhcHNlZC50b0ZpeGVkKDIpfSBtcylgXG4gICAgICApO1xuICAgIH07XG4gIH0sXG4gIG9wZW5DdXJzb3I6IChyZXEsIHsgdGFibGVOYW1lIH0pID0+IHtcbiAgICByZXR1cm4gKF9yZXMsIHsgdGltZUVsYXBzZWQgfSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIGBEZXhpZSB8ICR7dGFibGVOYW1lfSBbIE9wZW4gQ3Vyc29yIC0gICR7Z2VuZXJhdGVRdWVyeVJlcXVlc3RLZXkoXG4gICAgICAgICAgcmVxLnF1ZXJ5XG4gICAgICAgICl9IF0gKCR7dGltZUVsYXBzZWQudG9GaXhlZCgyKX0gbXMpYFxuICAgICAgKTtcbiAgICB9O1xuICB9LFxuICBjb3VudDogKHJlcSwgeyB0YWJsZU5hbWUgfSkgPT4ge1xuICAgIHJldHVybiAoX3JlcywgeyB0aW1lRWxhcHNlZCB9KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgYERleGllIHwgJHt0YWJsZU5hbWV9IFsgQ291bnQgLSAgJHtnZW5lcmF0ZVF1ZXJ5UmVxdWVzdEtleShcbiAgICAgICAgICByZXEucXVlcnlcbiAgICAgICAgKX0gXSAoJHt0aW1lRWxhcHNlZC50b0ZpeGVkKDIpfSBtcylgXG4gICAgICApO1xuICAgIH07XG4gIH0sXG59O1xuIiwiaW1wb3J0IHtcbiAgREJDb3JlLFxuICBEQkNvcmVDb3VudFJlcXVlc3QsXG4gIERCQ29yZUdldE1hbnlSZXF1ZXN0LFxuICBEQkNvcmVHZXRSZXF1ZXN0LFxuICBEQkNvcmVLZXlSYW5nZSxcbiAgREJDb3JlTXV0YXRlUmVxdWVzdCxcbiAgREJDb3JlT3BlbkN1cnNvclJlcXVlc3QsXG4gIERCQ29yZVF1ZXJ5LFxuICBEQkNvcmVRdWVyeVJlcXVlc3QsXG4gIERCQ29yZVRyYW5zYWN0aW9uLFxuICBNaWRkbGV3YXJlLFxufSBmcm9tIFwiZGV4aWVcIjtcblxuLy8gaW1wb3J0IHsgdXNlRGV2dG9vbHMgfSBmcm9tIFwiLi9kZXZ0b29scy9kZXZ0b29sc1wiO1xuaW1wb3J0IHtcbiAgT3BlcmF0aW9uLFxuICBSZXNwb25zZUxvZ2dpbmdDYWxsYmFjayxcbiAgZGVmYXVsdExvZ2dpbmdDYWxsYmFja3MsXG4gIG1pbmltYWxMb2dnaW5nQ2FsbGJhY2tzLFxufSBmcm9tIFwiLi9sb2dnZXJzXCI7XG5cbmNvbnN0IFJBTkdFX1RZUEVTID0gWywgXCJlcXVhbFwiLCBcInJhbmdlXCIsIFwiYW55XCIsIFwibmV2ZXJcIl07XG5cbmNvbnN0IGdlbmVyYXRlUmFuZ2VLZXkgPSAocmFuZ2U6IERCQ29yZUtleVJhbmdlKSA9PiB7XG4gIHN3aXRjaCAoUkFOR0VfVFlQRVNbcmFuZ2UudHlwZV0pIHtcbiAgICBjYXNlIFwiZXF1YWxcIjpcbiAgICAgIHJldHVybiBgZXF1YWxgO1xuICAgIGNhc2UgXCJyYW5nZVwiOlxuICAgICAgcmV0dXJuIGAke3JhbmdlLmxvd2VyT3BlbiA/IFwiKFwiIDogXCJbXCJ9JHtKU09OLnN0cmluZ2lmeShcbiAgICAgICAgcmFuZ2UubG93ZXJcbiAgICAgICl9OiR7SlNPTi5zdHJpbmdpZnkocmFuZ2UudXBwZXIpfSR7cmFuZ2UudXBwZXJPcGVuID8gXCIpXCIgOiBcIl1cIn1gO1xuICAgIGNhc2UgXCJhbnlcIjpcbiAgICAgIHJldHVybiBgYW55YDtcbiAgICBjYXNlIFwibmV2ZXJcIjpcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFwibmV2ZXJcIjtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGdlbmVyYXRlUXVlcnlSZXF1ZXN0S2V5ID0gKHF1ZXJ5OiBEQkNvcmVRdWVyeSkgPT4ge1xuICByZXR1cm4gYHF1ZXJ5Olske1xuICAgIHF1ZXJ5LmluZGV4ID8gcXVlcnkuaW5kZXgubmFtZSB8fCBcInByaW1hcnlcIiA6IFwicHJpbWFyeVwiXG4gIH0scmFuZ2U6JHtnZW5lcmF0ZVJhbmdlS2V5KHF1ZXJ5LnJhbmdlKX1dYDtcbn07XG5cbmNvbnN0IGdlbmVyYXRlTXV0YXRlS2V5ID0gKHRhYmxlTmFtZTogc3RyaW5nLCByZXE6IERCQ29yZU11dGF0ZVJlcXVlc3QpID0+IHtcbiAgbGV0IHR5cGVTcGVjaWZpY0tleSA9IFwiXCI7XG4gIHN3aXRjaCAocmVxLnR5cGUpIHtcbiAgICBjYXNlIFwiYWRkXCI6XG4gICAgICB0eXBlU3BlY2lmaWNLZXkgPSBcIlwiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcInB1dFwiOlxuICAgICAgaWYgKHJlcS5jaGFuZ2VTcGVjKVxuICAgICAgICB0eXBlU3BlY2lmaWNLZXkgPSBgZmllbGRzOiR7T2JqZWN0LmtleXMocmVxLmNoYW5nZVNwZWMpLmpvaW4oXCIsXCIpfWA7XG4gICAgICBlbHNlIGlmIChyZXEuY2hhbmdlU3BlY3MpXG4gICAgICAgIHR5cGVTcGVjaWZpY0tleSA9IGBmaWVsZHM6JHtyZXEuY2hhbmdlU3BlY3NcbiAgICAgICAgICAubWFwKChjaGFuZ2VTcGVjKSA9PiBPYmplY3Qua2V5cyhjaGFuZ2VTcGVjKS5qb2luKFwiLFwiKSlcbiAgICAgICAgICAuam9pbihcIixcIil9YDtcbiAgICAgIGVsc2UgaWYgKHJlcS5jcml0ZXJpYSkgdHlwZVNwZWNpZmljS2V5ID0gSlNPTi5zdHJpbmdpZnkocmVxLmNyaXRlcmlhKTtcbiAgICAgIGVsc2UgaWYgKHJlcS5rZXlzKSB0eXBlU3BlY2lmaWNLZXkgPSBcImJ5S2V5c1wiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImRlbGV0ZVwiOlxuICAgICAgdHlwZVNwZWNpZmljS2V5ID0gcmVxLmNyaXRlcmlhID8gSlNPTi5zdHJpbmdpZnkocmVxLmNyaXRlcmlhKSA6IFwiYnlLZXlzXCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiZGVsZXRlUmFuZ2VcIjpcbiAgICAgIHR5cGVTcGVjaWZpY0tleSA9IHJlcS5yYW5nZSA/IGdlbmVyYXRlUmFuZ2VLZXkocmVxLnJhbmdlKSA6IFwiYWxsXCI7XG4gICAgICBicmVhaztcbiAgfVxuICByZXR1cm4gYFske3RhYmxlTmFtZX0sbXV0YXRlLCR7cmVxLnR5cGV9LCR7dHlwZVNwZWNpZmljS2V5fV1gO1xufTtcbmNvbnN0IGdlbmVyYXRlR2V0S2V5ID0gKHRhYmxlTmFtZTogc3RyaW5nKSA9PiBgWyR7dGFibGVOYW1lfSxnZXQsYnlLZXldYDtcbmNvbnN0IGdlbmVyYXRlR2V0TWFueUtleSA9ICh0YWJsZU5hbWU6IHN0cmluZywgcmVxOiBEQkNvcmVHZXRNYW55UmVxdWVzdCkgPT5cbiAgYFske3RhYmxlTmFtZX0sZ2V0TWFueSxieUtleXMke3JlcS5jYWNoZSA/IGAsJHtyZXEuY2FjaGV9YCA6IFwiXCJ9XWA7XG5jb25zdCBnZW5lcmF0ZU9wZW5DdXJzb3JLZXkgPSAoXG4gIHRhYmxlTmFtZTogc3RyaW5nLFxuICByZXE6IERCQ29yZU9wZW5DdXJzb3JSZXF1ZXN0XG4pID0+XG4gIGBbJHt0YWJsZU5hbWV9LG9wZW5DdXJzb3Ike1xuICAgIHJlcS5yZXZlcnNlID8gXCIscmV2ZXJzZVwiIDogXCJcIlxuICB9LCR7Z2VuZXJhdGVRdWVyeVJlcXVlc3RLZXkocmVxLnF1ZXJ5KX1dYDtcbmNvbnN0IGdlbmVyYXRlUXVlcnlLZXkgPSAodGFibGVOYW1lOiBzdHJpbmcsIHJlcTogREJDb3JlUXVlcnlSZXF1ZXN0KSA9PlxuICBgWyR7dGFibGVOYW1lfSxxdWVyeSwke2dlbmVyYXRlUXVlcnlSZXF1ZXN0S2V5KHJlcS5xdWVyeSl9XWA7XG5jb25zdCBnZW5lcmF0ZUNvdW50S2V5ID0gKHRhYmxlTmFtZTogc3RyaW5nLCByZXE6IERCQ29yZVF1ZXJ5UmVxdWVzdCkgPT5cbiAgYFske3RhYmxlTmFtZX0sY291bnQsJHtnZW5lcmF0ZVF1ZXJ5UmVxdWVzdEtleShyZXEucXVlcnkpfV1gO1xuXG5leHBvcnQgZW51bSBMb2dUeXBlIHtcbiAgRGVmYXVsdCA9IFwiREVGQVVMVFwiLFxuICBNaW5pbWFsID0gXCJNSU5JTUFMXCIsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9nZ2VyUHJvcHMge1xuICB0YWJsZVdoaXRlTGlzdD86IHN0cmluZ1tdO1xuICB0YWJsZXNCbGFja0xpc3Q/OiBzdHJpbmdbXTtcbiAgb3BlcmF0aW9uc1doaXRlTGlzdD86IE9wZXJhdGlvbltdO1xuICBvcGVyYXRpb25zQmxhY2tMaXN0PzogT3BlcmF0aW9uW107XG4gIGxvZ1R5cGU6IExvZ1R5cGU7XG59XG5cbmNvbnN0IGhhbmRsZVRyYW5zYWN0aW9ucyA9ICh0cmFuc2FjdGlvbjogREJDb3JlVHJhbnNhY3Rpb24sIGtleTogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IGV4aXN0cyA9IHRyYW5zYWN0aW9ucy5oYXModHJhbnNhY3Rpb24pO1xuICBjb25zdCBzdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgaWYgKCFleGlzdHMpIHtcbiAgICB0cmFuc2FjdGlvbnMuc2V0KHRyYW5zYWN0aW9uLCBba2V5XSk7XG4gICAgKHRyYW5zYWN0aW9uIGFzIElEQlRyYW5zYWN0aW9uKS5hZGRFdmVudExpc3RlbmVyKFwiY29tcGxldGVcIiwgKCkgPT4ge1xuICAgICAgY29uc3QgdGltZUVsYXBzZWQgPSBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBgRW5kZWQgdHJhbnNhY3Rpb24gKCR7dGltZUVsYXBzZWQudG9GaXhlZCgxKX0pYCxcbiAgICAgICAgdHJhbnNhY3Rpb25zLmdldCh0cmFuc2FjdGlvbilcbiAgICAgICk7XG4gICAgICB0cmFuc2FjdGlvbnMuZGVsZXRlKHRyYW5zYWN0aW9uKTtcbiAgICB9KTtcbiAgfSBlbHNlIHRyYW5zYWN0aW9ucy5nZXQodHJhbnNhY3Rpb24pIS5wdXNoKGtleSk7XG59O1xuXG5jb25zdCBERUZBVUxUX1BST1BTOiBMb2dnZXJQcm9wcyA9IHtcbiAgbG9nVHlwZTogTG9nVHlwZS5EZWZhdWx0LFxufTtcblxuY29uc3QgbG9nZ2Vyc0NhbGxiYWNrc0Zyb21Mb2dUeXBlID0gKGxvZ1R5cGU6IExvZ1R5cGUpID0+IHtcbiAgc3dpdGNoIChsb2dUeXBlKSB7XG4gICAgY2FzZSBMb2dUeXBlLk1pbmltYWw6XG4gICAgICByZXR1cm4gbWluaW1hbExvZ2dpbmdDYWxsYmFja3M7XG4gICAgY2FzZSBMb2dUeXBlLkRlZmF1bHQ6XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBkZWZhdWx0TG9nZ2luZ0NhbGxiYWNrcztcbiAgfVxufTtcblxuY29uc3QgdHJhbnNhY3Rpb25zID0gbmV3IE1hcDxEQkNvcmVUcmFuc2FjdGlvbiwgc3RyaW5nW10+KCk7XG5cbmNvbnN0IGRleGllTG9nZ2VyOiAocHJvcHM/OiBQYXJ0aWFsPExvZ2dlclByb3BzPikgPT4gTWlkZGxld2FyZTxEQkNvcmU+ID0gKFxuICBsb2dnZXJQcm9wc1xuKSA9PiB7XG4gIGNvbnN0IHtcbiAgICB0YWJsZVdoaXRlTGlzdCxcbiAgICB0YWJsZXNCbGFja0xpc3QsXG4gICAgb3BlcmF0aW9uc0JsYWNrTGlzdCxcbiAgICBvcGVyYXRpb25zV2hpdGVMaXN0LFxuICAgIGxvZ1R5cGUsXG4gIH0gPSB7IC4uLkRFRkFVTFRfUFJPUFMsIC4uLmxvZ2dlclByb3BzIH07XG5cbiAgLy8gdXNlRGV2dG9vbHMoKTtcblxuICBpZiAodGFibGVXaGl0ZUxpc3QgJiYgdGFibGVzQmxhY2tMaXN0KVxuICAgIHRocm93IEVycm9yKFxuICAgICAgXCJZb3UgY2FuJ3QgdXNlIGJvdGggdGFibGVXaGl0ZUxpc3QgYW5kIHRhYmxlc0JsYWNrTGlzdCBhdCB0aGUgc2FtZSB0aW1lXCJcbiAgICApO1xuXG4gIGlmIChvcGVyYXRpb25zV2hpdGVMaXN0ICYmIG9wZXJhdGlvbnNCbGFja0xpc3QpXG4gICAgdGhyb3cgRXJyb3IoXG4gICAgICBcIllvdSBjYW4ndCB1c2UgYm90aCBvcGVyYXRpb25zV2hpdGVMaXN0IGFuZCBvcGVyYXRpb25zQmxhY2tMaXN0IGF0IHRoZSBzYW1lIHRpbWVcIlxuICAgICk7XG5cbiAgY29uc3Qgc2hvdWxkTG9nID0gKHRhYmxlTmFtZTogc3RyaW5nLCBvcGVyYXRpb246IE9wZXJhdGlvbikgPT4ge1xuICAgIGxldCBzaG91bGRMb2dPcGVyYXRpb24gPSBmYWxzZTtcblxuICAgIGlmIChvcGVyYXRpb25zV2hpdGVMaXN0KVxuICAgICAgc2hvdWxkTG9nT3BlcmF0aW9uID0gb3BlcmF0aW9uc1doaXRlTGlzdC5pbmNsdWRlcyhvcGVyYXRpb24pO1xuICAgIGVsc2UgaWYgKG9wZXJhdGlvbnNCbGFja0xpc3QpXG4gICAgICBzaG91bGRMb2dPcGVyYXRpb24gPSAhb3BlcmF0aW9uc0JsYWNrTGlzdC5pbmNsdWRlcyhvcGVyYXRpb24pO1xuICAgIGVsc2Ugc2hvdWxkTG9nT3BlcmF0aW9uID0gdHJ1ZTtcblxuICAgIGxldCBzaG91bGRMb2dUYWJsZSA9IGZhbHNlO1xuXG4gICAgaWYgKHRhYmxlV2hpdGVMaXN0KSBzaG91bGRMb2dUYWJsZSA9IHRhYmxlV2hpdGVMaXN0LmluY2x1ZGVzKHRhYmxlTmFtZSk7XG4gICAgZWxzZSBpZiAodGFibGVzQmxhY2tMaXN0KVxuICAgICAgc2hvdWxkTG9nVGFibGUgPSAhdGFibGVzQmxhY2tMaXN0LmluY2x1ZGVzKHRhYmxlTmFtZSk7XG4gICAgZWxzZSBzaG91bGRMb2dUYWJsZSA9IHRydWU7XG5cbiAgICByZXR1cm4gc2hvdWxkTG9nT3BlcmF0aW9uICYmIHNob3VsZExvZ1RhYmxlO1xuICB9O1xuXG4gIGNvbnN0IGNhbGxiYWNrcyA9IGxvZ2dlcnNDYWxsYmFja3NGcm9tTG9nVHlwZShsb2dUeXBlKTtcblxuICByZXR1cm4ge1xuICAgIHN0YWNrOiBcImRiY29yZVwiLFxuICAgIG5hbWU6IFwibG9nZ2VyXCIsXG4gICAgY3JlYXRlKGRvd25sZXZlbERhdGFiYXNlKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5kb3dubGV2ZWxEYXRhYmFzZSxcbiAgICAgICAgdGFibGUodGFibGVOYW1lKSB7XG4gICAgICAgICAgY29uc3QgZG93bmxldmVsVGFibGUgPSBkb3dubGV2ZWxEYXRhYmFzZS50YWJsZSh0YWJsZU5hbWUpO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5kb3dubGV2ZWxUYWJsZSxcbiAgICAgICAgICAgIG11dGF0ZTogYXN5bmMgKHJlcTogREJDb3JlTXV0YXRlUmVxdWVzdCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgICAgLy8gY29uc3Qga2V5ID0gZ2VuZXJhdGVNdXRhdGVLZXkodGFibGVOYW1lLCByZXEpO1xuICAgICAgICAgICAgICAvLyBjb25zdCB0cmFuc2FjdGlvbiA9IHJlcS50cmFucztcbiAgICAgICAgICAgICAgLy8gaGFuZGxlVHJhbnNhY3Rpb25zKHRyYW5zYWN0aW9uLCBrZXkpO1xuXG4gICAgICAgICAgICAgIC8vIExvZyB0aGUgcmVxdWVzdFxuICAgICAgICAgICAgICBsZXQgcmVzcG9uc2VMb2dnZXI6IFJlc3BvbnNlTG9nZ2luZ0NhbGxiYWNrPFwibXV0YXRlXCI+IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICBpZiAoc2hvdWxkTG9nKHRhYmxlTmFtZSwgXCJtdXRhdGVcIikpXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VMb2dnZXIgPSBjYWxsYmFja3NbXCJtdXRhdGVcIl0/LihyZXEsIHtcbiAgICAgICAgICAgICAgICAgIHRhYmxlTmFtZSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICByZXR1cm4gZG93bmxldmVsVGFibGUubXV0YXRlKHJlcSkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGltZUVsYXBzZWQgPSBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0VGltZTtcblxuICAgICAgICAgICAgICAgIC8vIExvZyB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkTG9nKHRhYmxlTmFtZSwgXCJtdXRhdGVcIikpXG4gICAgICAgICAgICAgICAgICByZXNwb25zZUxvZ2dlcj8uKHJlcywge1xuICAgICAgICAgICAgICAgICAgICB0aW1lRWxhcHNlZCxcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldDogYXN5bmMgKHJlcTogREJDb3JlR2V0UmVxdWVzdCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgICAgLy8gY29uc3Qga2V5ID0gZ2VuZXJhdGVHZXRLZXkodGFibGVOYW1lKTtcbiAgICAgICAgICAgICAgLy8gY29uc3QgdHJhbnNhY3Rpb24gPSByZXEudHJhbnM7XG4gICAgICAgICAgICAgIC8vIGhhbmRsZVRyYW5zYWN0aW9ucyh0cmFuc2FjdGlvbiwga2V5KTtcblxuICAgICAgICAgICAgICAvLyBMb2cgdGhlIHJlcXVlc3RcbiAgICAgICAgICAgICAgbGV0IHJlc3BvbnNlTG9nZ2VyOiBSZXNwb25zZUxvZ2dpbmdDYWxsYmFjazxcImdldFwiPiB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgaWYgKHNob3VsZExvZyh0YWJsZU5hbWUsIFwiZ2V0XCIpKVxuICAgICAgICAgICAgICAgIHJlc3BvbnNlTG9nZ2VyID0gY2FsbGJhY2tzW1wiZ2V0XCJdPy4ocmVxLCB7XG4gICAgICAgICAgICAgICAgICB0YWJsZU5hbWUsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgcmV0dXJuIGRvd25sZXZlbFRhYmxlLmdldChyZXEpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVFbGFwc2VkID0gcGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydFRpbWU7XG5cbiAgICAgICAgICAgICAgICAvLyBMb2cgdGhlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZExvZyh0YWJsZU5hbWUsIFwiZ2V0XCIpKVxuICAgICAgICAgICAgICAgICAgcmVzcG9uc2VMb2dnZXI/LihyZXMsIHtcbiAgICAgICAgICAgICAgICAgICAgdGltZUVsYXBzZWQsXG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXRNYW55OiBhc3luYyAocmVxOiBEQkNvcmVHZXRNYW55UmVxdWVzdCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgICAgLy8gY29uc3Qga2V5ID0gZ2VuZXJhdGVHZXRNYW55S2V5KHRhYmxlTmFtZSwgcmVxKTtcbiAgICAgICAgICAgICAgLy8gY29uc3QgdHJhbnNhY3Rpb24gPSByZXEudHJhbnM7XG4gICAgICAgICAgICAgIC8vIGhhbmRsZVRyYW5zYWN0aW9ucyh0cmFuc2FjdGlvbiwga2V5KTtcblxuICAgICAgICAgICAgICAvLyBMb2cgdGhlIHJlcXVlc3RcbiAgICAgICAgICAgICAgbGV0IHJlc3BvbnNlTG9nZ2VyOlxuICAgICAgICAgICAgICAgIHwgUmVzcG9uc2VMb2dnaW5nQ2FsbGJhY2s8XCJnZXRNYW55XCI+XG4gICAgICAgICAgICAgICAgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgIGlmIChzaG91bGRMb2codGFibGVOYW1lLCBcImdldE1hbnlcIikpXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VMb2dnZXIgPSBjYWxsYmFja3NbXCJnZXRNYW55XCJdPy4ocmVxLCB7XG4gICAgICAgICAgICAgICAgICB0YWJsZU5hbWUsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgcmV0dXJuIGRvd25sZXZlbFRhYmxlLmdldE1hbnkocmVxKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aW1lRWxhcHNlZCA9IHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRUaW1lO1xuXG4gICAgICAgICAgICAgICAgLy8gTG9nIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGlmIChzaG91bGRMb2codGFibGVOYW1lLCBcImdldE1hbnlcIikpXG4gICAgICAgICAgICAgICAgICByZXNwb25zZUxvZ2dlcj8uKHJlcywge1xuICAgICAgICAgICAgICAgICAgICB0aW1lRWxhcHNlZCxcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHF1ZXJ5OiBhc3luYyAocmVxOiBEQkNvcmVRdWVyeVJlcXVlc3QpID0+IHtcbiAgICAgICAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgICAgICAgIC8vIGNvbnN0IGtleSA9IGdlbmVyYXRlUXVlcnlLZXkodGFibGVOYW1lLCByZXEpO1xuICAgICAgICAgICAgICAvLyBjb25zdCB0cmFuc2FjdGlvbiA9IHJlcS50cmFucztcbiAgICAgICAgICAgICAgLy8gaGFuZGxlVHJhbnNhY3Rpb25zKHRyYW5zYWN0aW9uLCBrZXkpO1xuXG4gICAgICAgICAgICAgIC8vIExvZyB0aGUgcmVxdWVzdFxuICAgICAgICAgICAgICBsZXQgcmVzcG9uc2VMb2dnZXI6IFJlc3BvbnNlTG9nZ2luZ0NhbGxiYWNrPFwicXVlcnlcIj4gfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgIGlmIChzaG91bGRMb2codGFibGVOYW1lLCBcInF1ZXJ5XCIpKVxuICAgICAgICAgICAgICAgIHJlc3BvbnNlTG9nZ2VyID0gY2FsbGJhY2tzW1wicXVlcnlcIl0/LihyZXEsIHtcbiAgICAgICAgICAgICAgICAgIHRhYmxlTmFtZSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICByZXR1cm4gZG93bmxldmVsVGFibGUucXVlcnkocmVxKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aW1lRWxhcHNlZCA9IHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRUaW1lO1xuXG4gICAgICAgICAgICAgICAgLy8gTG9nIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGlmIChzaG91bGRMb2codGFibGVOYW1lLCBcInF1ZXJ5XCIpKVxuICAgICAgICAgICAgICAgICAgcmVzcG9uc2VMb2dnZXI/LihyZXMsIHtcbiAgICAgICAgICAgICAgICAgICAgdGltZUVsYXBzZWQsXG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvcGVuQ3Vyc29yOiBhc3luYyAocmVxOiBEQkNvcmVPcGVuQ3Vyc29yUmVxdWVzdCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgICAgLy8gY29uc3Qga2V5ID0gZ2VuZXJhdGVPcGVuQ3Vyc29yS2V5KHRhYmxlTmFtZSwgcmVxKTtcbiAgICAgICAgICAgICAgLy8gY29uc3QgdHJhbnNhY3Rpb24gPSByZXEudHJhbnM7XG4gICAgICAgICAgICAgIC8vIGhhbmRsZVRyYW5zYWN0aW9ucyh0cmFuc2FjdGlvbiwga2V5KTtcblxuICAgICAgICAgICAgICAvLyBMb2cgdGhlIHJlcXVlc3RcbiAgICAgICAgICAgICAgbGV0IHJlc3BvbnNlTG9nZ2VyOlxuICAgICAgICAgICAgICAgIHwgUmVzcG9uc2VMb2dnaW5nQ2FsbGJhY2s8XCJvcGVuQ3Vyc29yXCI+XG4gICAgICAgICAgICAgICAgfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgIGlmIChzaG91bGRMb2codGFibGVOYW1lLCBcIm9wZW5DdXJzb3JcIikpXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VMb2dnZXIgPSBjYWxsYmFja3NbXCJvcGVuQ3Vyc29yXCJdPy4ocmVxLCB7XG4gICAgICAgICAgICAgICAgICB0YWJsZU5hbWUsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgcmV0dXJuIGRvd25sZXZlbFRhYmxlLm9wZW5DdXJzb3IocmVxKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aW1lRWxhcHNlZCA9IHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRUaW1lO1xuXG4gICAgICAgICAgICAgICAgLy8gTG9nIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGlmIChzaG91bGRMb2codGFibGVOYW1lLCBcIm9wZW5DdXJzb3JcIikpXG4gICAgICAgICAgICAgICAgICByZXNwb25zZUxvZ2dlcj8uKHJlcywge1xuICAgICAgICAgICAgICAgICAgICB0aW1lRWxhcHNlZCxcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvdW50OiBhc3luYyAocmVxOiBEQkNvcmVDb3VudFJlcXVlc3QpID0+IHtcbiAgICAgICAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgICAgICAgIC8vIGNvbnN0IGtleSA9IGdlbmVyYXRlQ291bnRLZXkodGFibGVOYW1lLCByZXEpO1xuICAgICAgICAgICAgICAvLyBjb25zdCB0cmFuc2FjdGlvbiA9IHJlcS50cmFucztcbiAgICAgICAgICAgICAgLy8gaGFuZGxlVHJhbnNhY3Rpb25zKHRyYW5zYWN0aW9uLCBrZXkpO1xuXG4gICAgICAgICAgICAgIC8vIExvZyB0aGUgcmVxdWVzdFxuICAgICAgICAgICAgICBsZXQgcmVzcG9uc2VMb2dnZXI6IFJlc3BvbnNlTG9nZ2luZ0NhbGxiYWNrPFwiY291bnRcIj4gfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgIGlmIChzaG91bGRMb2codGFibGVOYW1lLCBcImNvdW50XCIpKVxuICAgICAgICAgICAgICAgIHJlc3BvbnNlTG9nZ2VyID0gY2FsbGJhY2tzW1wiY291bnRcIl0/LihyZXEsIHtcbiAgICAgICAgICAgICAgICAgIHRhYmxlTmFtZSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICByZXR1cm4gZG93bmxldmVsVGFibGUuY291bnQocmVxKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aW1lRWxhcHNlZCA9IHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRUaW1lO1xuXG4gICAgICAgICAgICAgICAgLy8gTG9nIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGlmIChzaG91bGRMb2codGFibGVOYW1lLCBcImNvdW50XCIpKVxuICAgICAgICAgICAgICAgICAgcmVzcG9uc2VMb2dnZXI/LihyZXMsIHtcbiAgICAgICAgICAgICAgICAgICAgdGltZUVsYXBzZWQsXG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfSxcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGRleGllTG9nZ2VyO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBRU8sTUFBTSx1QkFBdUIsR0FBcUI7SUFDdkQsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsU0FBUyxFQUFFLEtBQUk7QUFDN0IsUUFBQSxPQUFPLENBQUMsY0FBYyxDQUFDLFdBQVcsU0FBUyxDQUFBLHNCQUFBLENBQXdCLENBQUMsQ0FBQztBQUNyRSxRQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RCLFFBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJ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
