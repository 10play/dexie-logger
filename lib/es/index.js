
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

export { dexieLogger as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kZXZ0b29scy9iYWRnZS50cyIsIi4uLy4uL3NyYy9kZXZ0b29scy9kb21VdGlscy50cyIsIi4uLy4uL3NyYy9kZXZ0b29scy9kZXZ0b29scy50cyIsIi4uLy4uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6W251bGwsbnVsbCxudWxsLG51bGxdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFPLE1BQU0sS0FBSyxHQUFHLDhJQUE4STs7QUNBNUosTUFBTSxXQUFXLEdBQUcsQ0FBQyxFQUFVLEtBQUk7SUFDeEMsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNoRCxJQUFBLFNBQVMsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLE9BQU8sU0FBUyxDQUFDLFVBQXlCLENBQUM7QUFDN0MsQ0FBQzs7QUNETSxNQUFNLFdBQVcsR0FBRyxNQUFLO0lBQzlCLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQy9DLENBQUM7O0FDaUZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLE1BQU0sYUFBYSxHQUFnQixFQUFFLENBQUM7QUFFdEMsTUFBTSxXQUFXLEdBQWdELENBQy9ELFdBQVcsS0FDVDtBQUNGLElBQUEsTUFBTSxFQUNKLGNBQWMsRUFDZCxlQUFlLEVBQ2YsbUJBQW1CLEVBQ25CLG1CQUFtQixHQUNwQixHQUFHLFdBQVcsSUFBSSxhQUFhLENBQUM7QUFFakMsSUFBQSxXQUFXLEVBQUUsQ0FBQTtJQUViLElBQUksY0FBYyxJQUFJLGVBQWU7QUFDbkMsUUFBQSxNQUFNLEtBQUssQ0FDVCx3RUFBd0UsQ0FDekUsQ0FBQztJQUVKLElBQUksbUJBQW1CLElBQUksbUJBQW1CO0FBQzVDLFFBQUEsTUFBTSxL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
