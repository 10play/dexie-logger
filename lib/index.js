
  /**
   * @license
   * author: Noam Golani <noam.golani@gmail.com>
   * dexie-logger.js v1.2.3
   * Released under the MIT license.
   */

this["dexie-logger"] = (function () {
    'use strict';

    // setInterval(() => {
    //   console.log('Dexie | Key Counts');
    //   const sortedTimes = Array.from(keyCounts.entries())
    //     .map(([key, times]) => ({
    //       key,
    //       count: times.length,
    //       avg: times.reduce((a, b) => a + b, 0) / times.length
    //     }))
    //     .sort((a, b) => b.count * b.avg - a.count * a.avg);
    //   console.table(sortedTimes);
    //   console.log(sortedTimes.slice(0, 3));
    // }, 10000);
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
                                const startTime = performance.now();
                                if (shouldLog(tableName, "mutate")) {
                                    console.groupCollapsed(`Dexie | ${tableName} [ Mutate ] => Request`);
                                    console.log(req.type);
                                    console.log(JSON.stringify(req, undefined, 2));
                                    console.groupEnd();
                                }
                                return downlevelTable.mutate(req).then((res) => {
                                    const timeElapsed = performance.now() - startTime;
                                    if (shouldLog(tableName, "mutate")) {
                                        console.groupCollapsed(`Dexie | ${tableName} [ Mutate ] (${timeElapsed.toFixed(1)} ms) <= Response`);
                                        console.log("-> Duration: " + timeElapsed + " ms");
                                        console.log(JSON.stringify(res, undefined, 2));
                                        console.groupEnd();
                                    }
                                    return res;
                                });
                            },
                            get: async (req) => {
                                const startTime = performance.now();
                                if (shouldLog(tableName, "get")) {
                                    console.groupCollapsed(`Dexie | ${tableName} [ Get ] => Request`);
                                    console.log(req.key);
                                    console.log(JSON.stringify(req, undefined, 2));
                                    console.groupEnd();
                                }
                                return downlevelTable.get(req).then((res) => {
                                    const timeElapsed = performance.now() - startTime;
                                    if (shouldLog(tableName, "get")) {
                                        console.groupCollapsed(`Dexie | ${tableName} [ Get ] (${timeElapsed.toFixed(1)} ms) <= Response`);
                                        console.log("-> Duration: " + timeElapsed + " ms");
                                        console.log(JSON.stringify(res, undefined, 2));
                                        console.groupEnd();
                                    }
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                                    return res;
                                });
                            },
                            getMany: async (req) => {
                                const startTime = performance.now();
                                if (shouldLog(tableName, "getMany")) {
                                    console.groupCollapsed(`Dexie | ${tableName} [ Get Many ] => Request`);
                                    console.log(req.keys);
                                    console.log(JSON.stringify(req, undefined, 2));
                                    console.groupEnd();
                                }
                                return downlevelTable.getMany(req).then((res) => {
                                    const timeElapsed = performance.now() - startTime;
                                    if (shouldLog(tableName, "getMany")) {
                                        console.groupCollapsed(`Dexie | ${tableName} [ Get Many ] (${timeElapsed.toFixed(1)} ms) <= Response`);
                                        console.log("-> Duration: " + timeElapsed + " ms");
                                        console.log(JSON.stringify(res, undefined, 2));
                                        console.groupEnd();
                                    }
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                                    return res;
                                });
                            },
                            query: async (req) => {
                                const startTime = performance.now();
                                if (shouldLog(tableName, "query")) {
                                    console.groupCollapsed(`Dexie | ${tableName}  [ Query ] => Request`);
                                    console.log(req.query);
                                    console.log(req);
                                    console.groupEnd();
                                }
                                return downlevelTable.query(req).then((res) => {
                                    const timeElapsed = performance.now() - startTime;
                                    if (shouldLog(tableName, "query")) {
                                        console.groupCollapsed(`Dexie | ${tableName}  [ Query ] (${timeElapsed.toFixed(1)} ms) <= Response`);
                                        console.log("-> Duration: " + timeElapsed + " ms");
                                        console.log(res);
                                        console.groupEnd();
                                    }
                                    return res;
                                });
                            },
                            openCursor: async (req) => {
                                const startTime = performance.now();
                                if (shouldLog(tableName, "openCursor")) {
                                    console.groupCollapsed(`Dexie | ${tableName} [ Open Cursor ] => Request`);
                                    console.log(`Dexie | Open Cursor | ${JSON.stringify(req.query, undefined, 2)}, ${tableName} - `);
                                    console.groupEnd();
                                }
                                return downlevelTable.openCursor(req).then((res) => {
                                    const timeElapsed = performance.now() - startTime;
                                    if (shouldLog(tableName, "openCursor")) {
                                        console.groupCollapsed(`Dexie | ${tableName} [ Open Cursor ] (${timeElapsed.toFixed(1)} ms) <= Response`);
                                        console.log("-> Duration: " + timeElapsed + " ms");
                                        console.log(JSON.stringify(res, undefined, 2));
                                        console.groupEnd();
                                    }
                                    return res;
                                });
                            },
                            count: async (req) => {
                                const startTime = performance.now();
                                if (shouldLog(tableName, "count")) {
                                    console.groupCollapsed(`Dexie | ${tableName} [ Count ] => Request`);
                                    console.log(req.query);
                                    console.log(req);
                                    console.groupEnd();
                                }
                                return downlevelTable.count(req).then((res) => {
                                    const timeElapsed = performance.now() - startTime;
                                    if (shouldLog(tableName, "count")) {
                                        console.groupCollapsed(`Dexie | ${tableName} [ Count ] (${timeElapsed.toFixed(1)} ms) <= Response`);
                                        console.log("-> Duration: " + timeElapsed + " ms");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6W251bGxdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQW9GQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFFQSxNQUFNLGFBQWEsR0FBZ0IsRUFBRSxDQUFDO0FBRXRDLFVBQU0sV0FBVyxHQUFnRCxDQUMvRCxXQUFXLEtBQ1Q7SUFDRixJQUFBLE1BQU0sRUFDSixjQUFjLEVBQ2QsZUFBZSxFQUNmLG1CQUFtQixFQUNuQixtQkFBbUIsR0FDcEIsR0FBRyxXQUFXLElBQUksYUFBYSxDQUFDO1FBQ2pDLElBQUksY0FBYyxJQUFJLGVBQWU7SUFDbkMsUUFBQSxNQUFNLEtBQUssQ0FDVCx3RUFBd0UsQ0FDekUsQ0FBQztRQUVKLElBQUksbUJBQW1CLElBQUksbUJBQW1CO0lBQzVDLFFBQUEsTUFBTSxLQUFLLENBQ1QsaUZBQWlGLENBQ2xGLENBQUM7SUFFSixJQUFBLE1BQU0sU0FBUyxHQUFHLENBQUMsU0FBaUIsRUFBRSxTQUFvQixLQUFJO1lBQzVELElBQUksa0JBQWtCLEdBQUcsS0FBSyxDQUFDO0lBRS9CLFFBQUEsSUFBSSxtQkFBbUI7SUFDckIsWUFBQSxrQkFBa0IsR0FBRyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDMUQsYUFBQSxJQUFJLG1CQUFtQjtnQkFDMUIsa0JBQWtCLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7O2dCQUMzRCxrQkFBa0IsR0FBRyxJQUFJLENBQUM7WUFFL0IsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDO0lBRTNCLFFBQUEsSUFBSSxjQUFjO0lBQUUsWUFBQSxjQUFjLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNuRSxhQUFBLElBQUksZUFBZTtnQkFDdEIsY0FBYyxHQUFHLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7Z0JBQ25ELGNBQWMsR0FBRyxJQUFJLENBQUM7WUFFM0IsT0FBTyxrQkFBa0IsSUFBSSxjQUFjLENBQUM7SUFDOUMsS0FBQyxDQUFDO1FBRUYsT0FBTztJQUNMLFFBQUEsS0FBSyxFQUFFLFFBQVE7SUFDZixRQUFBLElBQUksRUFBRSxRQUFRO0lBQ2QsUUFBQSxNQUFNLENBQUMsaUJBQWlCLEVBQUE7Z0JBQ3RCLE9BQU87SUFDTCxnQkFBQSxHQUFHLGlCQUFpQjtJQUNwQixnQkFBQSxLQUFLLENBQUMsU0FBUyxFQUFBO3dCQUNiLE1BQU0sY0FBYyxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDMUQsT0FBTztJQUNMLHdCQUFBLEdBQUcsY0FBYztJQUNqQix3QkFBQSxNQUFNLEVBQUUsT0FBTyxHQUF3QixLQUFJO0lBQ3pDLDRCQUFBLE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNwQyw0QkFBQSxJQUFJLFNBQVMsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQUU7SUFDbEMsZ0NBQUEsT0FBTyxDQUFDLGNBQWMsQ0FDcEIsV0FBVyxTQUFTLENBQUEsc0JBQUEsQ0FBd0IsQ0FDN0MsQ0FBQztJQUNGLGdDQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RCLGdDQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7b0NBQy9DLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNwQiw2QkFBQTtJQUNELDRCQUFBLE9BQU8sY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUk7b0NBQzdDLE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUM7SUFDbEQsZ0NBQUEsSUFBSSxTQUFTLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxFQUFFO0lBQ2xDLG9DQUFBLE9BQU8sQ0FBQyxjQUFjLENBQ3BCLENBQUEsUUFBQSxFQUFXLFNBQVMsQ0FBZ0IsYUFBQSxFQUFBLFdBQVcsQ0FBQyxPQUFPLENBQ3JELENBQUMsQ0FDRixDQUFBLGdCQUFBLENBQWtCLENBQ3BCLENBQUM7d0NBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEdBQUcsV0FBVyxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQ25ELG9DQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7d0NBQy9DLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNwQixpQ0FBQTtJQUNELGdDQUFBLE9BQU8sR0FBRyxDQUFDO0lBQ2IsNkJBQUMsQ0FBQyxDQUFDOzZCQUNKO0lBQ0Qsd0JBQUEsR0FBRyxFQUFFLE9BQU8sR0FBcUIsS0FBSTtJQUNuQyw0QkFBQSxNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDcEMsNEJBQUEsSUFBSSxTQUFTLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxFQUFFO0lBQy9CLGdDQUFBLE9BQU8sQ0FBQyxjQUFjLENBQ3BCLFdBQVcsU0FBUyxDQUFBLG1CQUFBLENBQXFCLENBQzFDLENBQUM7SUFDRixnQ0FBQSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNyQixnQ0FBQSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO29DQUMvQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDcEIsNkJBQUE7SUFDRCw0QkFBQSxPQUFPLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFJO29DQUMxQyxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsU0FBUyxDQUFDO0lBQ2xELGdDQUFBLElBQUksU0FBUyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsRUFBRTtJQUMvQixvQ0FBQSxPQUFPLENBQUMsY0FBYyxDQUNwQixDQUFBLFFBQUEsRUFBVyxTQUFTLENBQWEsVUFBQSxFQUFBLFdBQVcsQ0FBQyxPQUFPLENBQ2xELENBQUMsQ0FDRixDQUFBLGdCQUFBLENBQWtCLENBQ3BCLENBQUM7d0NBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEdBQUcsV0FBVyxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQ25ELG9DQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7d0NBQy9DLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNwQixpQ0FBQTs7SUFFRCxnQ0FBQSxPQUFPLEdBQUcsQ0FBQztJQUNiLDZCQUFDLENBQUMsQ0FBQzs2QkFDSjtJQUNELHdCQUFBLE9BQU8sRUFBRSxPQUFPLEdBQXlCLEtBQUk7SUFDM0MsNEJBQUEsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3BDLDRCQUFBLElBQUksU0FBUyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRTtJQUNuQyxnQ0FBQSxPQUFPLENBQUMsY0FBYyxDQUNwQixXQUFXLFNBQVMsQ0FBQSx3QkFBQSxDQUEwQixDQUMvQyxDQUFDO0lBQ0YsZ0NBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEIsZ0NBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQ0FDL0MsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3BCLDZCQUFBO0lBQ0QsNEJBQUEsT0FBTyxjQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSTtvQ0FDOUMsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLFNBQVMsQ0FBQztJQUNsRCxnQ0FBQSxJQUFJLFNBQVMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUU7SUFDbkMsb0NBQUEsT0FBTyxDQUFDLGNBQWMsQ0FDcEIsQ0FBQSxRQUFBLEVBQVcsU0FBUyxDQUFrQixlQUFBLEVBQUEsV0FBVyxDQUFDLE9BQU8sQ0FDdkQsQ0FBQyxDQUNGLENBQUEsZ0JBQUEsQ0FBa0IsQ0FDcEIsQ0FBQzt3Q0FDRixPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsR0FBRyxXQUFXLEdBQUcsS0FBSyxDQUFDLENBQUM7SUFDbkQsb0NBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3Q0FDL0MsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3BCLGlDQUFBOztJQUVELGdDQUFBLE9BQU8sR0FBRyxDQUFDO0lBQ2IsNkJBQUMsQ0FBQyxDQUFDOzZCQUNKO0lBQ0Qsd0JBQUEsS0FBSyxFQUFFLE9BQU8sR0FBdUIsS0FBSTtJQUN2Qyw0QkFBQSxNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDcEMsNEJBQUEsSUFBSSxTQUFTLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxFQUFFO0lBQ2pDLGdDQUFBLE9BQU8sQ0FBQyxjQUFjLENBQ3BCLFdBQVcsU0FBUyxDQUFBLHNCQUFBLENBQXdCLENBQzdDLENBQUM7SUFDRixnQ0FBQSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN2QixnQ0FBQSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29DQUNqQixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDcEIsNkJBQUE7SUFDRCw0QkFBQSxPQUFPLGNBQWMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFJO29DQUM1QyxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsU0FBUyxDQUFDO0lBQ2xELGdDQUFBLElBQUksU0FBUyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsRUFBRTtJQUNqQyxvQ0FBQSxPQUFPLENBQUMsY0FBYyxDQUNwQixDQUFBLFFBQUEsRUFBVyxTQUFTLENBQWdCLGFBQUEsRUFBQSxXQUFXLENBQUMsT0FBTyxDQUNyRCxDQUFDLENBQ0YsQ0FBQSxnQkFBQSxDQUFrQixDQUNwQixDQUFDO3dDQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxHQUFHLFdBQVcsR0FBRyxLQUFLLENBQUMsQ0FBQztJQUNuRCxvQ0FBQSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dDQUNqQixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDcEIsaUNBQUE7SUFDRCxnQ0FBQSxPQUFPLEdBQUcsQ0FBQztJQUNiLDZCQUFDLENBQUMsQ0FBQzs2QkFDSjtJQUNELHdCQUFBLFVBQVUsRUFBRSxPQUFPLEdBQTRCLEtBQUk7SUFDakQsNEJBQUEsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3BDLDRCQUFBLElBQUksU0FBUyxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsRUFBRTtJQUN0QyxnQ0FBQSxPQUFPLENBQUMsY0FBYyxDQUNwQixXQUFXLFNBQVMsQ0FBQSwyQkFBQSxDQUE2QixDQUNsRCxDQUFDO29DQUNGLE9BQU8sQ0FBQyxHQUFHLENBQ1QsQ0FBQSxzQkFBQSxFQUF5QixJQUFJLENBQUMsU0FBUyxDQUNyQyxHQUFHLENBQUMsS0FBSyxFQUNULFNBQVMsRUFDVCxDQUFDLENBQ0YsS0FBSyxTQUFTLENBQUEsR0FBQSxDQUFLLENBQ3JCLENBQUM7b0NBQ0YsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3BCLDZCQUFBO0lBQ0QsNEJBQUEsT0FBTyxjQUFjLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSTtvQ0FDakQsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLFNBQVMsQ0FBQztJQUNsRCxnQ0FBQSxJQUFJLFNBQVMsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLEVBQUU7SUFDdEMsb0NBQUEsT0FBTyxDQUFDLGNBQWMsQ0FDcEIsQ0FBQSxRQUFBLEVBQVcsU0FBUyxDQUFxQixrQkFBQSxFQUFBLFdBQVcsQ0FBQyxPQUFPLENBQzFELENBQUMsQ0FDRixDQUFBLGdCQUFBLENBQWtCLENBQ3BCLENBQUM7d0NBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEdBQUcsV0FBVyxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQ25ELG9DQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7d0NBQy9DLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNwQixpQ0FBQTtJQUNELGdDQUFBLE9BQU8sR0FBRyxDQUFDO0lBQ2IsNkJBQUMsQ0FBQyxDQUFDOzZCQUNKO0lBQ0Qsd0JBQUEsS0FBSyxFQUFFLE9BQU8sR0FBdUIsS0FBSTtJQUN2Qyw0QkFBQSxNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDcEMsNEJBQUEsSUFBSSxTQUFTLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxFQUFFO0lBQ2pDLGdDQUFBLE9BQU8sQ0FBQyxjQUFjLENBQ3BCLFdBQVcsU0FBUyxDQUFBLHFCQUFBLENBQXVCLENBQzVDLENBQUM7SUFDRixnQ0FBQSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN2QixnQ0FBQSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29DQUNqQixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDcEIsNkJBQUE7SUFDRCw0QkFBQSxPQUFPLGNBQWMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFJO29DQUM1QyxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsU0FBUyxDQUFDO0lBQ2xELGdDQUFBLElBQUksU0FBUyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsRUFBRTtJQUNqQyxvQ0FBQSxPQUFPLENBQUMsY0FBYyxDQUNwQixDQUFBLFFBQUEsRUFBVyxTQUFTLENBQWUsWUFBQSxFQUFBLFdBQVcsQ0FBQyxPQUFPLENBQ3BELENBQUMsQ0FDRixDQUFBLGdCQUFBLENBQWtCLENBQ3BCLENBQUM7d0NBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEdBQUcsV0FBVyxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQ25ELG9DQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7d0NBQ2pCLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNwQixpQ0FBQTtJQUNELGdDQUFBLE9BQU8sR0FBRyxDQUFDO0lBQ2IsNkJBQUMsQ0FBQyxDQUFDOzZCQUNKO3lCQUNGLENBQUM7cUJBQ0g7aUJBQ0YsQ0FBQzthQUNIO1NBQ0YsQ0FBQztJQUNKOzs7Ozs7OzsifQ==
