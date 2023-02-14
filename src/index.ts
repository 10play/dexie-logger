import {
  DBCore,
  DBCoreCountRequest,
  DBCoreGetManyRequest,
  DBCoreGetRequest,
  DBCoreMutateRequest,
  DBCoreOpenCursorRequest,
  DBCoreQueryRequest,
  DBCoreTable,
  Middleware,
} from "dexie";

export type Operation = keyof DBCoreTable;

export interface LoggerProps {
  tableWhiteList?: string[];
  tablesBlackList?: string[];
  operationsWhiteList?: Operation[];
  operationsBlackList?: Operation[];
}

const DEFAULT_PROPS: LoggerProps = {};

const dexieLogger: (props?: LoggerProps) => Middleware<DBCore> = (
  loggerProps
) => {
  const {
    tableWhiteList,
    tablesBlackList,
    operationsBlackList,
    operationsWhiteList,
  } = loggerProps || DEFAULT_PROPS;
  if (tableWhiteList && tablesBlackList)
    throw Error(
      "You can't use both tableWhiteList and tablesBlackList at the same time"
    );

  if (operationsWhiteList && operationsBlackList)
    throw Error(
      "You can't use both operationsWhiteList and operationsBlackList at the same time"
    );

  const shouldLog = (tableName: string, operation: Operation) => {
    let shouldLogOperation = false;

    if (operationsWhiteList)
      shouldLogOperation = operationsWhiteList.includes(operation);
    else if (operationsBlackList)
      shouldLogOperation = !operationsBlackList.includes(operation);
    else shouldLogOperation = true;

    let shouldLogTable = false;

    if (tableWhiteList) shouldLogTable = tableWhiteList.includes(tableName);
    else if (tablesBlackList)
      shouldLogTable = !tablesBlackList.includes(tableName);
    else shouldLogTable = true;

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
            mutate: async (req: DBCoreMutateRequest) => {
              const startTime = performance.now();
              if (shouldLog(tableName, "mutate")) {
                console.groupCollapsed(
                  `Dexie | ${tableName} [ Mutate ] => Request`
                );
                console.log(req.type);
                console.log(JSON.stringify(req, undefined, 2));
                console.groupEnd();
              }
              return downlevelTable.mutate(req).then((res) => {
                const timeElapsed = performance.now() - startTime;
                if (shouldLog(tableName, "mutate")) {
                  console.groupCollapsed(
                    `Dexie | ${tableName} [ Mutate ] (${timeElapsed.toFixed(
                      1
                    )} ms) <= Response`
                  );
                  console.log("-> Duration: " + timeElapsed + " ms");
                  console.log(JSON.stringify(res, undefined, 2));
                  console.groupEnd();
                }
                return res;
              });
            },
            get: async (req: DBCoreGetRequest) => {
              const startTime = performance.now();
              if (shouldLog(tableName, "get")) {
                console.groupCollapsed(
                  `Dexie | ${tableName} [ Get ] => Request`
                );
                console.log(req.key);
                console.log(JSON.stringify(req, undefined, 2));
                console.groupEnd();
              }
              return downlevelTable.get(req).then((res) => {
                const timeElapsed = performance.now() - startTime;
                if (shouldLog(tableName, "get")) {
                  console.groupCollapsed(
                    `Dexie | ${tableName} [ Get ] (${timeElapsed.toFixed(
                      1
                    )} ms) <= Response`
                  );
                  console.log("-> Duration: " + timeElapsed + " ms");
                  console.log(JSON.stringify(res, undefined, 2));
                  console.groupEnd();
                }
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return res;
              });
            },
            getMany: async (req: DBCoreGetManyRequest) => {
              const startTime = performance.now();
              if (shouldLog(tableName, "getMany")) {
                console.groupCollapsed(
                  `Dexie | ${tableName} [ Get Many ] => Request`
                );
                console.log(req.keys);
                console.log(JSON.stringify(req, undefined, 2));
                console.groupEnd();
              }
              return downlevelTable.getMany(req).then((res) => {
                const timeElapsed = performance.now() - startTime;
                if (shouldLog(tableName, "getMany")) {
                  console.groupCollapsed(
                    `Dexie | ${tableName} [ Get Many ] (${timeElapsed.toFixed(
                      1
                    )} ms) <= Response`
                  );
                  console.log("-> Duration: " + timeElapsed + " ms");
                  console.log(JSON.stringify(res, undefined, 2));
                  console.groupEnd();
                }
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return res;
              });
            },
            query: async (req: DBCoreQueryRequest) => {
              const startTime = performance.now();
              if (shouldLog(tableName, "query")) {
                console.groupCollapsed(
                  `Dexie | ${tableName}  [ Query ] => Request`
                );
                console.log(req.query);
                console.log(req);
                console.groupEnd();
              }
              return downlevelTable.query(req).then((res) => {
                const timeElapsed = performance.now() - startTime;
                if (shouldLog(tableName, "query")) {
                  console.groupCollapsed(
                    `Dexie | ${tableName}  [ Query ] (${timeElapsed.toFixed(
                      1
                    )} ms) <= Response`
                  );
                  console.log("-> Duration: " + timeElapsed + " ms");
                  console.log(res);
                  console.groupEnd();
                }
                return res;
              });
            },
            openCursor: async (req: DBCoreOpenCursorRequest) => {
              const startTime = performance.now();
              if (shouldLog(tableName, "openCursor")) {
                console.groupCollapsed(
                  `Dexie | ${tableName} [ Open Cursor ] => Request`
                );
                console.log(
                  `Dexie | Open Cursor | ${JSON.stringify(
                    req.query,
                    undefined,
                    2
                  )}, ${tableName} - `
                );
                console.groupEnd();
              }
              return downlevelTable.openCursor(req).then((res) => {
                const timeElapsed = performance.now() - startTime;
                if (shouldLog(tableName, "openCursor")) {
                  console.groupCollapsed(
                    `Dexie | ${tableName} [ Open Cursor ] (${timeElapsed.toFixed(
                      1
                    )} ms) <= Response`
                  );
                  console.log("-> Duration: " + timeElapsed + " ms");
                  console.log(JSON.stringify(res, undefined, 2));
                  console.groupEnd();
                }
                return res;
              });
            },
            count: async (req: DBCoreCountRequest) => {
              const startTime = performance.now();
              if (shouldLog(tableName, "count")) {
                console.groupCollapsed(
                  `Dexie | ${tableName} [ Count ] => Request`
                );
                console.log(req.query);
                console.log(req);
                console.groupEnd();
              }
              return downlevelTable.count(req).then((res) => {
                const timeElapsed = performance.now() - startTime;
                if (shouldLog(tableName, "count")) {
                  console.groupCollapsed(
                    `Dexie | ${tableName} [ Count ] (${timeElapsed.toFixed(
                      1
                    )} ms) <= Response`
                  );
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

export default dexieLogger;
