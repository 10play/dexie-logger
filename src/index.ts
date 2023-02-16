import {
  DBCore,
  DBCoreCountRequest,
  DBCoreGetManyRequest,
  DBCoreGetRequest,
  DBCoreKeyRange,
  DBCoreMutateRequest,
  DBCoreOpenCursorRequest,
  DBCoreQuery,
  DBCoreQueryRequest,
  DBCoreTable,
  Middleware,
} from "dexie";

import { useDevtools } from "./devtools/devtools";

export type Operation = keyof DBCoreTable;

const RANGE_TYPES = [, 'equal', 'range', 'any', 'never'];

const generateRangeKey = (range: DBCoreKeyRange) => {
  switch (RANGE_TYPES[range.type]) {
    case 'equal':
      return `equal`;
    case 'range':
      return `${range.lowerOpen ? '(' : '['}${JSON.stringify(range.lower)}:${JSON.stringify(range.upper)}${
        range.upperOpen ? ')' : ']'
      }`;
    case 'any':
      return `any`;
    case 'never':
    default:
      return 'never';
  }
};

const generateQueryRequestKey = (query: DBCoreQuery) => {
  return `query:[${query.index ? query.index.name || 'primary' : 'primary'},range:${generateRangeKey(query.range)}]`;
};

const generateMutateKey = (tableName: string, req: DBCoreMutateRequest) => {
  let typeSpecificKey = '';
  switch (req.type) {
    case 'add':
      typeSpecificKey = '';
      break;
    case 'put':
      if (req.changeSpec) typeSpecificKey = `fields:${Object.keys(req.changeSpec).join(',')}`;
      else if (req.changeSpecs)
        typeSpecificKey = `fields:${req.changeSpecs.map((changeSpec) => Object.keys(changeSpec).join(',')).join(',')}`;
      else if (req.criteria) typeSpecificKey = JSON.stringify(req.criteria);
      else if (req.keys) typeSpecificKey = 'byKeys';
      break;
    case 'delete':
      typeSpecificKey = req.criteria ? JSON.stringify(req.criteria) : 'byKeys';
      break;
    case 'deleteRange':
      typeSpecificKey = req.range ? generateRangeKey(req.range) : 'all';
      break;
  }
  return `[${tableName},mutate,${req.type},${typeSpecificKey}]`;
};
const generateGetKey = (tableName: string) => `[${tableName},get,byKey]`;
const generateGetManyKey = (tableName: string, req: DBCoreGetManyRequest) =>
  `[${tableName},getMany,byKeys${req.cache ? `,${req.cache}` : ''}]`;
const generateOpenCursorKey = (tableName: string, req: DBCoreOpenCursorRequest) =>
  `[${tableName},openCursor${req.reverse ? ',reverse' : ''},${generateQueryRequestKey(req.query)}]`;
const generateQueryKey = (tableName: string, req: DBCoreQueryRequest) =>
  `[${tableName},query,${generateQueryRequestKey(req.query)}]`;
const generateCountKey = (tableName: string, req: DBCoreQueryRequest) =>
  `[${tableName},count,${generateQueryRequestKey(req.query)}]`;

export interface LoggerProps {
  tableWhiteList?: string[];
  tablesBlackList?: string[];
  operationsWhiteList?: Operation[];
  operationsBlackList?: Operation[];
}

const keyCounts = new Map<string, number[]>();

const addToKeyCounts = (key: string, time: number) => {
  if (!keyCounts.has(key)) keyCounts.set(key, [time]);
  else keyCounts.get(key)!.push(time);
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

  useDevtools()

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
