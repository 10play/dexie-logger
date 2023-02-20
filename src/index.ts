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
  Middleware,
} from "dexie";

import { useDevtools } from "./devtools/devtools";
import {
  Operation,
  ResponseLoggingCallback,
  defaultLoggingCallbacks,
} from "./loggers";

const RANGE_TYPES = [, "equal", "range", "any", "never"];

const generateRangeKey = (range: DBCoreKeyRange) => {
  switch (RANGE_TYPES[range.type]) {
    case "equal":
      return `equal`;
    case "range":
      return `${range.lowerOpen ? "(" : "["}${JSON.stringify(
        range.lower
      )}:${JSON.stringify(range.upper)}${range.upperOpen ? ")" : "]"}`;
    case "any":
      return `any`;
    case "never":
    default:
      return "never";
  }
};

const generateQueryRequestKey = (query: DBCoreQuery) => {
  return `query:[${
    query.index ? query.index.name || "primary" : "primary"
  },range:${generateRangeKey(query.range)}]`;
};

const generateMutateKey = (tableName: string, req: DBCoreMutateRequest) => {
  let typeSpecificKey = "";
  switch (req.type) {
    case "add":
      typeSpecificKey = "";
      break;
    case "put":
      if (req.changeSpec)
        typeSpecificKey = `fields:${Object.keys(req.changeSpec).join(",")}`;
      else if (req.changeSpecs)
        typeSpecificKey = `fields:${req.changeSpecs
          .map((changeSpec) => Object.keys(changeSpec).join(","))
          .join(",")}`;
      else if (req.criteria) typeSpecificKey = JSON.stringify(req.criteria);
      else if (req.keys) typeSpecificKey = "byKeys";
      break;
    case "delete":
      typeSpecificKey = req.criteria ? JSON.stringify(req.criteria) : "byKeys";
      break;
    case "deleteRange":
      typeSpecificKey = req.range ? generateRangeKey(req.range) : "all";
      break;
  }
  return `[${tableName},mutate,${req.type},${typeSpecificKey}]`;
};
const generateGetKey = (tableName: string) => `[${tableName},get,byKey]`;
const generateGetManyKey = (tableName: string, req: DBCoreGetManyRequest) =>
  `[${tableName},getMany,byKeys${req.cache ? `,${req.cache}` : ""}]`;
const generateOpenCursorKey = (
  tableName: string,
  req: DBCoreOpenCursorRequest
) =>
  `[${tableName},openCursor${
    req.reverse ? ",reverse" : ""
  },${generateQueryRequestKey(req.query)}]`;
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

  useDevtools();

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

  const callbacks = defaultLoggingCallbacks;

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

              let responseLogger: ResponseLoggingCallback<"mutate"> | undefined;
              if (shouldLog(tableName, "mutate"))
                responseLogger = callbacks["mutate"]?.(req, {
                  tableName,
                });

              return downlevelTable.mutate(req).then((res) => {
                const timeElapsed = performance.now() - startTime;
                if (shouldLog(tableName, "mutate"))
                  responseLogger?.(res, {
                    timeElapsed,
                  });
                return res;
              });
            },
            get: async (req: DBCoreGetRequest) => {
              const startTime = performance.now();
              let responseLogger: ResponseLoggingCallback<"get"> | undefined;
              if (shouldLog(tableName, "get"))
                responseLogger = callbacks["get"]?.(req, {
                  tableName,
                });
              return downlevelTable.get(req).then((res) => {
                const timeElapsed = performance.now() - startTime;
                if (shouldLog(tableName, "get"))
                  responseLogger?.(res, {
                    timeElapsed,
                  });
                return res;
              });
            },
            getMany: async (req: DBCoreGetManyRequest) => {
              const startTime = performance.now();
              let responseLogger:
                | ResponseLoggingCallback<"getMany">
                | undefined;
              if (shouldLog(tableName, "getMany"))
                responseLogger = callbacks["getMany"]?.(req, {
                  tableName,
                });
              return downlevelTable.getMany(req).then((res) => {
                const timeElapsed = performance.now() - startTime;
                if (shouldLog(tableName, "getMany"))
                  responseLogger?.(res, {
                    timeElapsed,
                  });
                return res;
              });
            },
            query: async (req: DBCoreQueryRequest) => {
              const startTime = performance.now();
              let responseLogger: ResponseLoggingCallback<"query"> | undefined;
              if (shouldLog(tableName, "query"))
                responseLogger = callbacks["query"]?.(req, {
                  tableName,
                });
              return downlevelTable.query(req).then((res) => {
                const timeElapsed = performance.now() - startTime;
                if (shouldLog(tableName, "query"))
                  responseLogger?.(res, {
                    timeElapsed,
                  });
                return res;
              });
            },
            openCursor: async (req: DBCoreOpenCursorRequest) => {
              const startTime = performance.now();
              let responseLogger:
                | ResponseLoggingCallback<"openCursor">
                | undefined;
              if (shouldLog(tableName, "openCursor"))
                responseLogger = callbacks["openCursor"]?.(req, {
                  tableName,
                });
              return downlevelTable.openCursor(req).then((res) => {
                const timeElapsed = performance.now() - startTime;
                if (shouldLog(tableName, "openCursor"))
                  responseLogger?.(res, {
                    timeElapsed,
                  });
                return res;
              });
            },
            count: async (req: DBCoreCountRequest) => {
              const startTime = performance.now();
              let responseLogger: ResponseLoggingCallback<"count"> | undefined;
              if (shouldLog(tableName, "count"))
                responseLogger = callbacks["count"]?.(req, {
                  tableName,
                });
              return downlevelTable.count(req).then((res) => {
                const timeElapsed = performance.now() - startTime;
                if (shouldLog(tableName, "count"))
                  responseLogger?.(res, {
                    timeElapsed,
                  });
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
