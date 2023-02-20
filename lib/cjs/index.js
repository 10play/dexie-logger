
  /**
   * @license
   * author: Noam Golani <noam.golani@gmail.com>
   * dexie-logger.js v1.2.3
   * Released under the MIT license.
   */

'use strict';

const badge = `<div style="background-color: purple; border-radius: 50%; height: 50px; width: 50px; position: fixed; bottom: 20px; right: 20px;">test</div>`;

const stringToDOM = (el) => {
    const container = document.createElement('div');
    container.innerHTML = el;
    return container.firstChild;
};

const useDevtools = () => {
    document.body.appendChild(stringToDOM(badge));
};

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
const DEFAULT_PROPS = {};
const transactions = new Map();
const dexieLogger = (loggerProps) => {
    const { tableWhiteList, tablesBlackList, operationsBlackList, operationsWhiteList, } = loggerProps || DEFAULT_PROPS;
    useDevtools();
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
    const callbacks = defaultLoggingCallbacks;
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
                            const key = generateMutateKey(tableName, req);
                            const transaction = req.trans;
                            handleTransactions(transaction, key);
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
                            const key = generateGetKey(tableName);
                            const transaction = req.trans;
                            handleTransactions(transaction, key);
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
                            const key = generateGetManyKey(tableName, req);
                            const transaction = req.trans;
                            handleTransactions(transaction, key);
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
                            const key = generateQueryKey(tableName, req);
                            const transaction = req.trans;
                            handleTransactions(transaction, key);
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
                            const key = generateOpenCursorKey(tableName, req);
                            const transaction = req.trans;
                            handleTransactions(transaction, key);
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
                            const key = generateCountKey(tableName, req);
                            const transaction = req.trans;
                            handleTransactions(transaction, key);
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

module.exports = dexieLogger;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kZXZ0b29scy9iYWRnZS50cyIsIi4uLy4uL3NyYy9kZXZ0b29scy9kb21VdGlscy50cyIsIi4uLy4uL3NyYy9kZXZ0b29scy9kZXZ0b29scy50cyIsIi4uLy4uL3NyYy9sb2dnZXJzL2RlZmF1bHQudHMiLCIuLi8uLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOltudWxsLG51bGwsbnVsbCxudWxsLG51bGxdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQU8sTUFBTSxLQUFLLEdBQUcsOElBQThJOztBQ0E1SixNQUFNLFdBQVcsR0FBRyxDQUFDLEVBQVUsS0FBSTtJQUN4QyxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hELElBQUEsU0FBUyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDekIsT0FBTyxTQUFTLENBQUMsVUFBeUIsQ0FBQztBQUM3QyxDQUFDOztBQ0RNLE1BQU0sV0FBVyxHQUFHLE1BQUs7SUFDOUIsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFDL0MsQ0FBQzs7QUNITSxNQUFNLHVCQUF1QixHQUFxQjtJQUN2RCxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxTQUFTLEVBQUUsS0FBSTtBQUM3QixRQUFBLE9BQU8sQ0FBQyxjQUFjLENBQUMsV0FBVyxTQUFTLENBQUEsc0JBQUEsQ0FBd0IsQ0FBQyxDQUFDO0FBQ3JFLFFBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEIsUUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9DLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNu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
