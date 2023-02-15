
  /**
   * @license
   * author: Noam Golani <noam.golani@gmail.com>
   * dexie-logger.js v1.2.3
   * Released under the MIT license.
   */

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

module.exports = dexieLogger;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kZXZ0b29scy9iYWRnZS50cyIsIi4uLy4uL3NyYy9kZXZ0b29scy9kb21VdGlscy50cyIsIi4uLy4uL3NyYy9kZXZ0b29scy9kZXZ0b29scy50cyIsIi4uLy4uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6W251bGwsbnVsbCxudWxsLG51bGxdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQU8sTUFBTSxLQUFLLEdBQUcsOElBQThJOztBQ0E1SixNQUFNLFdBQVcsR0FBRyxDQUFDLEVBQVUsS0FBSTtJQUN4QyxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hELElBQUEsU0FBUyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDekIsT0FBTyxTQUFTLENBQUMsVUFBeUIsQ0FBQztBQUM3QyxDQUFDOztBQ0RNLE1BQU0sV0FBVyxHQUFHLE1BQUs7SUFDOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUVoQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtBQUMvQyxDQUFDOztBQytFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxNQUFNLGFBQWEsR0FBZ0IsRUFBRSxDQUFDO0FBRXRDLE1BQU0sV0FBVyxHQUFnRCxDQUMvRCxXQUFXLEtBQ1Q7QUFDRixJQUFBLFdBQVcsRUFBRSxDQUFDO0FBQ2QsSUFBQSxNQUFNLEVBQ0osY0FBYyxFQUNkLGVBQWUsRUFDZixtQkFBbUIsRUFDbkIsbUJBQW1CLEdBQ3BCLEdBQUcsV0FBVyxJQUFJLGFBQWEsQ0FBQztJQUNqQyxJQUFJLGNBQWMsSUFBSSxlQUFlO0FBQ25DLFFBQUEsTUFBTSxLQUFLLENBQ1Qsd0VBQXdF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
