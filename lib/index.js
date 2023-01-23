
  /**
   * @license
   * author: Noam Golani <noam.golani@gmail.com>
   * dexie-logger.js v1.2.0
   * Released under the MIT license.
   */

this["dexie-logger"] = (function () {
    'use strict';

    const DEFAULT_PROPS = {};
    const dexieLogger = (loggerProps) => {
        const { tableWhiteList, tablesBlackList, operationsBlackList, operationsWhiteList, } = loggerProps || DEFAULT_PROPS;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6W251bGxdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQXFCQSxNQUFNLGFBQWEsR0FBZ0IsRUFBRSxDQUFDO0FBRXRDLFVBQU0sV0FBVyxHQUFnRCxDQUMvRCxXQUFXLEtBQ1Q7SUFDRixJQUFBLE1BQU0sRUFDSixjQUFjLEVBQ2QsZUFBZSxFQUNmLG1CQUFtQixFQUNuQixtQkFBbUIsR0FDcEIsR0FBRyxXQUFXLElBQUksYUFBYSxDQUFDO1FBQ2pDLElBQUksY0FBYyxJQUFJLGVBQWU7SUFDbkMsUUFBQSxNQUFNLEtBQUssQ0FDVCx3RUFBd0UsQ0FDekUsQ0FBQztRQUVKLElBQUksbUJBQW1CLElBQUksbUJBQW1CO0lBQzVDLFFBQUEsTUFBTSxLQUFLLENBQ1QsaUZBQWlGLENBQ2xGLENBQUM7SUFFSixJQUFBLE1BQU0sU0FBUyxHQUFHLENBQUMsU0FBaUIsRUFBRSxTQUFvQixLQUFJO1lBQzVELElBQUksa0JBQWtCLEdBQUcsS0FBSyxDQUFDO0lBRS9CLFFBQUEsSUFBSSxtQkFBbUI7SUFDckIsWUFBQSxrQkFBa0IsR0FBRyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDMUQsYUFBQSxJQUFJLG1CQUFtQjtnQkFDMUIsa0JBQWtCLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7O2dCQUMzRCxrQkFBa0IsR0FBRyxJQUFJLENBQUM7WUFFL0IsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDO0lBRTNCLFFBQUEsSUFBSSxjQUFjO0lBQUUsWUFBQSxjQUFjLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNuRSxhQUFBLElBQUksZUFBZTtnQkFDdEIsY0FBYyxHQUFHLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7Z0JBQ25ELGNB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
