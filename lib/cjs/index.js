
  /**
   * @license
   * author: Noam Golani <noam.golani@gmail.com>
   * dexie-logger.js v1.1.9
   * Released under the MIT license.
   */

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

module.exports = dexieLogger;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6W251bGxdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBcUJBLE1BQU0sV0FBVyxHQUErQyxDQUM5RCxXQUFXLEtBQ1Q7SUFDRixNQUFNLEVBQ0osY0FBYyxFQUNkLGVBQWUsRUFDZixtQkFBbUIsRUFDbkIsbUJBQW1CLEdBQ3BCLEdBQUcsV0FBVyxDQUFDO0lBQ2hCLElBQUksY0FBYyxJQUFJLGVBQWU7QUFDbkMsUUFBQSxNQUFNLEtBQUssQ0FDVCx3RUFBd0UsQ0FDekUsQ0FBQztJQUVKLElBQUksbUJBQW1CLElBQUksbUJBQW1CO0FBQzVDLFFBQUEsTUFBTSxLQUFLLENBQ1QsaUZBQWlGLENBQ2xGLENBQUM7QUFFSixJQUFBLE1BQU0sU0FBUyxHQUFHLENBQUMsU0FBaUIsRUFBRSxTQUFvQixLQUFJO1FBQzVELElBQUksa0JBQWtCLEdBQUcsS0FBSyxDQUFDO0FBRS9CLFFBQUEsSUFBSSxtQkFBbUI7QUFDckIsWUFBQSxrQkFBa0IsR0FBRyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDMUQsYUFBQSxJQUFJLG1CQUFtQjtZQUMxQixrQkFBa0IsR0FBRyxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7WUFDM0Qsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO1FBRS9CLElBQUksY0FBYyxHQUFHLEtBQUssQ0FBQztBQUUzQixRQUFBLElBQUksY0FBYztBQUFFLFlBQUEsY0FBYyxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkUsYUFBQSxJQUFJLGVBQWU7WUFDdEIsY0FBYyxHQUFHLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7WUFDbkQsY0FBYyxHQUFHLElBQUksQ0FBQztRQUUzQixPQUFPLGtCQUFrQixJQUFJLGNBQWMsQ0FB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
