
  /**
   * @license
   * author: Noam Golani <noam.golani@gmail.com>
   * dexie-logger.js v1.1.8
   * Released under the MIT license.
   */

this["dexie-logger"] = (function () {
    'use strict';

    const dexieLogger = (loggerProps) => {
        const { tableWhiteList, tablesBlackList, operationsBlackList, operationsWhiteList, } = loggerProps;
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
                                if (shouldLog(tableName, "mutate")) {
                                    console.groupCollapsed(`Dexie | ${tableName} [ Mutate ] => Request`);
                                    console.log(req.type);
                                    console.log(JSON.stringify(req, undefined, 2));
                                    console.groupEnd();
                                }
                                return downlevelTable.mutate(req).then((res) => {
                                    if (shouldLog(tableName, "mutate")) {
                                        console.groupCollapsed(`Dexie | ${tableName} [ Mutate ] <= Response`);
                                        console.log(JSON.stringify(res, undefined, 2));
                                        console.groupEnd();
                                    }
                                    return res;
                                });
                            },
                            get: async (req) => {
                                if (shouldLog(tableName, "get")) {
                                    console.groupCollapsed(`Dexie | ${tableName} [ Get ] => Request`);
                                    console.log(req.key);
                                    console.log(JSON.stringify(req, undefined, 2));
                                    console.groupEnd();
                                }
                                return downlevelTable.get(req).then((res) => {
                                    if (shouldLog(tableName, "get")) {
                                        console.groupCollapsed(`Dexie | ${tableName} [ Get ] <= Response`);
                                        console.log(JSON.stringify(res, undefined, 2));
                                        console.groupEnd();
                                    }
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                                    return res;
                                });
                            },
                            getMany: async (req) => {
                                if (shouldLog(tableName, "getMany")) {
                                    console.groupCollapsed(`Dexie | ${tableName} [ Get Many ] => Request`);
                                    console.log(req.keys);
                                    console.log(JSON.stringify(req, undefined, 2));
                                    console.groupEnd();
                                }
                                return downlevelTable.getMany(req).then((res) => {
                                    if (shouldLog(tableName, "getMany")) {
                                        console.groupCollapsed(`Dexie | ${tableName} [ Get Many ] <= Response`);
                                        console.log(JSON.stringify(res, undefined, 2));
                                        console.groupEnd();
                                    }
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                                    return res;
                                });
                            },
                            query: async (req) => {
                                if (shouldLog(tableName, "query")) {
                                    console.groupCollapsed(`Dexie | ${tableName}  [ Query ] => Request`);
                                    console.log(req.query);
                                    console.log(req);
                                    console.groupEnd();
                                }
                                return downlevelTable.query(req).then((res) => {
                                    if (shouldLog(tableName, "query")) {
                                        console.groupCollapsed(`Dexie | ${tableName}  [ Query ] <= Response`);
                                        console.log(res);
                                        console.groupEnd();
                                    }
                                    return res;
                                });
                            },
                            openCursor: async (req) => {
                                if (shouldLog(tableName, "openCursor")) {
                                    console.groupCollapsed(`Dexie | ${tableName} [ Open Cursor ] => Request`);
                                    console.log(`Dexie | Open Cursor | ${JSON.stringify(req.query, undefined, 2)}, ${tableName} - `);
                                    console.groupEnd();
                                }
                                return downlevelTable.openCursor(req).then((res) => {
                                    if (shouldLog(tableName, "openCursor")) {
                                        console.groupCollapsed(`Dexie | ${tableName} [ Open Cursor ] <= Response`);
                                        console.log(JSON.stringify(res, undefined, 2));
                                        console.groupEnd();
                                    }
                                    return res;
                                });
                            },
                            count: async (req) => {
                                if (shouldLog(tableName, "count")) {
                                    console.groupCollapsed(`Dexie | ${tableName} [ Count ] => Request`);
                                    console.log(req.query);
                                    console.log(req);
                                    console.groupEnd();
                                }
                                return downlevelTable.count(req).then((res) => {
                                    if (shouldLog(tableName, "count")) {
                                        console.groupCollapsed(`Dexie | ${tableName} [ Count ] <= Response`);
                                        console.log(res);
                                        console.groupEnd();
                                    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6W251bGxdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQXFCQSxVQUFNLFdBQVcsR0FBK0MsQ0FDOUQsV0FBVyxLQUNUO1FBQ0YsTUFBTSxFQUNKLGNBQWMsRUFDZCxlQUFlLEVBQ2YsbUJBQW1CLEVBQ25CLG1CQUFtQixHQUNwQixHQUFHLFdBQVcsQ0FBQztRQUNoQixJQUFJLGNBQWMsSUFBSSxlQUFlO0lBQ25DLFFBQUEsTUFBTSxLQUFLLENBQ1Qsd0VBQXdFLENBQ3pFLENBQUM7UUFFSixJQUFJLG1CQUFtQixJQUFJLG1CQUFtQjtJQUM1QyxRQUFBLE1BQU0sS0FBSyxDQUNULGlGQUFpRixDQUNsRixDQUFDO0lBRUosSUFBQSxNQUFNLFNBQVMsR0FBRyxDQUFDLFNBQWlCLEVBQUUsU0FBb0IsS0FBSTtZQUM1RCxJQUFJLGtCQUFrQixHQUFHLEtBQUssQ0FBQztJQUUvQixRQUFBLElBQUksbUJBQW1CO0lBQ3JCLFlBQUEsa0JBQWtCLEdBQUcsbUJBQW1CLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzFELGFBQUEsSUFBSSxtQkFBbUI7Z0JBQzFCLGtCQUFrQixHQUFHLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDOztnQkFDM0Qsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO1lBRS9CLElBQUksY0FBYyxHQUFHLEtBQUssQ0FBQztJQUUzQixRQUFBLElBQUksY0FBYztJQUFFLFlBQUEsY0FBYyxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbkUsYUFBQSxJQUFJLGVBQWU7Z0JBQ3RCLGNBQWMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7O2dCQUNuRCxjQUFjLEdBQUcsSUFBSSxDQUFDO1lBRTNCLE9BQU8sa0JBQWtCLElBQUksY0FBYyxD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
