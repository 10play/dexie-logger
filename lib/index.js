
  /**
   * @license
   * author: Noam Golani <noam.golani@gmail.com>
   * dexie-logger.js v1.2.3
   * Released under the MIT license.
   */

this["dexie-logger"] = (function () {
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

    return dexieLogger;

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9kZXZ0b29scy9iYWRnZS50cyIsIi4uL3NyYy9kZXZ0b29scy9kb21VdGlscy50cyIsIi4uL3NyYy9kZXZ0b29scy9kZXZ0b29scy50cyIsIi4uL3NyYy9sb2dnZXJzL2RlZmF1bHQudHMiLCIuLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOltudWxsLG51bGwsbnVsbCxudWxsLG51bGxdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUFPLE1BQU0sS0FBSyxHQUFHLDhJQUE4STs7SUNBNUosTUFBTSxXQUFXLEdBQUcsQ0FBQyxFQUFVLEtBQUk7UUFDeEMsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoRCxJQUFBLFNBQVMsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLE9BQU8sU0FBUyxDQUFDLFVBQXlCLENBQUM7SUFDN0MsQ0FBQzs7SUNETSxNQUFNLFdBQVcsR0FBRyxNQUFLO1FBQzlCLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBQy9DLENBQUM7O0lDSE0sTUFBTSx1QkFBdUIsR0FBcUI7UUFDdkQsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsU0FBUyxFQUFFLEtBQUk7SUFDN0IsUUFBQSxPQUFPLENBQUMsY0FBYyxDQUFDLFdBQVcsU0FBUyxDQUFBLHNCQUFBLENBQXdCLENBQUMsQ0FBQztJQUNyRSxRQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RCLFFBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbkIsUUFBQSxPQUFPLENB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
