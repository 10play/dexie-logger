
  /**
   * @license
   * author: Noam Golani <noam.golani@gmail.com>
   * dexie-logger.js v1.2.3
   * Released under the MIT license.
   */

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

export { dexieLogger as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kZXZ0b29scy9iYWRnZS50cyIsIi4uLy4uL3NyYy9kZXZ0b29scy9kb21VdGlscy50cyIsIi4uLy4uL3NyYy9kZXZ0b29scy9kZXZ0b29scy50cyIsIi4uLy4uL3NyYy9sb2dnZXJzL2RlZmF1bHQudHMiLCIuLi8uLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOltudWxsLG51bGwsbnVsbCxudWxsLG51bGxdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFPLE1BQU0sS0FBSyxHQUFHLDhJQUE4STs7QUNBNUosTUFBTSxXQUFXLEdBQUcsQ0FBQyxFQUFVLEtBQUk7SUFDeEMsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNoRCxJQUFBLFNBQVMsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLE9BQU8sU0FBUyxDQUFDLFVBQXlCLENBQUM7QUFDN0MsQ0FBQzs7QUNETSxNQUFNLFdBQVcsR0FBRyxNQUFLO0lBQzlCLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQy9DLENBQUM7O0FDSE0sTUFBTSx1QkFBdUIsR0FBcUI7SUFDdkQsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsU0FBUyxFQUFFLEtBQUk7QUFDN0IsUUFBQSxPQUFPLENBQUMsY0FBYyxDQUFDLFdBQVcsU0FBUyxDQUFBLHNCQUFBLENBQXdCLENBQUMsQ0FBQztBQUNyRSxRQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RCLFFBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDbkIs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
