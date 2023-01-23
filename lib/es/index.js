
  /**
   * @license
   * author: Noam Golani <noam.golani@gmail.com>
   * dexie-logger.js v1.1.9
   * Released under the MIT license.
   */

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

export { dexieLogger as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6W251bGxdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQXFCQSxNQUFNLFdBQVcsR0FBK0MsQ0FDOUQsV0FBVyxLQUNUO0lBQ0YsTUFBTSxFQUNKLGNBQWMsRUFDZCxlQUFlLEVBQ2YsbUJBQW1CLEVBQ25CLG1CQUFtQixHQUNwQixHQUFHLFdBQVcsQ0FBQztJQUNoQixJQUFJLGNBQWMsSUFBSSxlQUFlO0FBQ25DLFFBQUEsTUFBTSxLQUFLLENBQ1Qsd0VBQXdFLENBQ3pFLENBQUM7SUFFSixJQUFJLG1CQUFtQixJQUFJLG1CQUFtQjtBQUM1QyxRQUFBLE1BQU0sS0FBSyxDQUNULGlGQUFpRixDQUNsRixDQUFDO0FBRUosSUFBQSxNQUFNLFNBQVMsR0FBRyxDQUFDLFNBQWlCLEVBQUUsU0FBb0IsS0FBSTtRQUM1RCxJQUFJLGtCQUFrQixHQUFHLEtBQUssQ0FBQztBQUUvQixRQUFBLElBQUksbUJBQW1CO0FBQ3JCLFlBQUEsa0JBQWtCLEdBQUcsbUJBQW1CLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzFELGFBQUEsSUFBSSxtQkFBbUI7WUFDMUIsa0JBQWtCLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7O1lBQzNELGtCQUFrQixHQUFHLElBQUksQ0FBQztRQUUvQixJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUM7QUFFM0IsUUFBQSxJQUFJLGNBQWM7QUFBRSxZQUFBLGNBQWMsR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ25FLGFBQUEsSUFBSSxlQUFlO1lBQ3RCLGNBQWMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7O1lBQ25ELGNBQWMsR0FBRyxJQUFJLENBQUM7UUFFM0IsT0FBTyxrQkFBa0IsSUFBSSxjQUFjLENBQUM7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
