
  /**
   * @license
   * author: Noam Golani <noam.golani@gmail.com>
   * dexie-logger.js v1.2.3
   * Released under the MIT license.
   */

this["dexie-logger"] = (function () {
    'use strict';

    const badge = `<div style="background-color: purple; border-radius: 50%; height: 15px; width: 15px; position: fixed; bottom: 20px; right: 20px;">test</div>`;

    const stringToDOM = (el) => {
        const container = document.createElement('div');
        container.innerHTML = el;
        return container.firstChild;
    };

    const useDevtools = () => {
        console.log(stringToDOM(badge));
        document.body.appendChild(stringToDOM(badge));
    };

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
        useDevtools();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9kZXZ0b29scy9iYWRnZS50cyIsIi4uL3NyYy9kZXZ0b29scy9kb21VdGlscy50cyIsIi4uL3NyYy9kZXZ0b29scy9kZXZ0b29scy50cyIsIi4uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6W251bGwsbnVsbCxudWxsLG51bGxdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUFPLE1BQU0sS0FBSyxHQUFHLDhJQUE4STs7SUNBNUosTUFBTSxXQUFXLEdBQUcsQ0FBQyxFQUFVLEtBQUk7UUFDeEMsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoRCxJQUFBLFNBQVMsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLE9BQU8sU0FBUyxDQUFDLFVBQXlCLENBQUM7SUFDN0MsQ0FBQzs7SUNETSxNQUFNLFdBQVcsR0FBRyxNQUFLO1FBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFFaEMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7SUFDL0MsQ0FBQzs7SUMrRUQ7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBRUEsTUFBTSxhQUFhLEdBQWdCLEVBQUUsQ0FBQztBQUV0QyxVQUFNLFdBQVcsR0FBZ0QsQ0FDL0QsV0FBVyxLQUNUO0lBQ0YsSUFBQSxXQUFXLEVBQUUsQ0FBQztJQUNkLElBQUEsTUFBTSxFQUNKLGNBQWMsRUFDZCxlQUFlLEVBQ2YsbUJBQW1CLEVBQ25CLG1CQUFtQixHQUNwQixHQUFHLFdBQVcsSUFBSSxhQUFhLENBQUM7UUFDakMsSUFBSSxjQUFjLElBQUksZUFBZTtJQUNuQyxRQUFBLE1BQU0sS0FBSyxDQUNULHdFQUF3RSxDQUN6RSxDQUFD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
