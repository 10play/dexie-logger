import { LoggingCallbacks } from ".";

export const defaultLoggingCallbacks: LoggingCallbacks = {
  mutate: (req, { tableName }) => {
    console.groupCollapsed(`Dexie | ${tableName} [ Mutate ] => Request`);
    console.log(req.type);
    console.log(JSON.stringify(req, undefined, 2));
    console.groupEnd();
    return (res, { timeElapsed }) => {
      console.groupCollapsed(
        `Dexie | ${tableName} [ Mutate ] (${timeElapsed.toFixed(
          1
        )} ms) <= Response`
      );
      console.log("-> Duration: " + timeElapsed + " ms");
      console.log(JSON.stringify(res, undefined, 2));
      console.groupEnd();
    };
  },
  get: (req, { tableName }) => {
    console.groupCollapsed(`Dexie | ${tableName} [ Get ] => Request`);
    console.log(req.key);
    console.log(JSON.stringify(req, undefined, 2));
    console.groupEnd();
    return (res, { timeElapsed }) => {
      console.groupCollapsed(
        `Dexie | ${tableName} [ Get ] (${timeElapsed.toFixed(
          1
        )} ms) <= Response`
      );
      console.log("-> Duration: " + timeElapsed + " ms");
      console.log(JSON.stringify(res, undefined, 2));
      console.groupEnd();
    };
  },
  getMany: (req, { tableName }) => {
    console.groupCollapsed(`Dexie | ${tableName} [ Get Many ] => Request`);
    console.log(req.keys);
    console.log(JSON.stringify(req, undefined, 2));
    console.groupEnd();
    return (res, { timeElapsed }) => {
      console.groupCollapsed(
        `Dexie | ${tableName} [ Get Many ] (${timeElapsed.toFixed(
          1
        )} ms) <= Response`
      );
      console.log("-> Duration: " + timeElapsed + " ms");
      console.log(JSON.stringify(res, undefined, 2));
      console.groupEnd();
    };
  },
  query: (req, { tableName }) => {
    console.groupCollapsed(`Dexie | ${tableName}  [ Query ] => Request`);
    console.log(req.query);
    console.log(req);
    console.groupEnd();
    return (res, { timeElapsed }) => {
      console.groupCollapsed(
        `Dexie | ${tableName}  [ Query ] (${timeElapsed.toFixed(
          1
        )} ms) <= Response`
      );
      console.log("-> Duration: " + timeElapsed + " ms");
      console.log(res);
      console.groupEnd();
    };
  },
  openCursor: (req, { tableName }) => {
    console.groupCollapsed(`Dexie | ${tableName} [ Open Cursor ] => Request`);
    console.log(
      `Dexie | Open Cursor | ${JSON.stringify(
        req.query,
        undefined,
        2
      )}, ${tableName} - `
    );
    console.groupEnd();
    return (res, { timeElapsed }) => {
      console.groupCollapsed(
        `Dexie | ${tableName} [ Open Cursor ] (${timeElapsed.toFixed(
          1
        )} ms) <= Response`
      );
      console.log("-> Duration: " + timeElapsed + " ms");
      console.log(JSON.stringify(res, undefined, 2));
      console.groupEnd();
    };
  },
  count: (req, { tableName }) => {
    console.groupCollapsed(`Dexie | ${tableName} [ Count ] => Request`);
    console.log(req.query);
    console.log(req);
    console.groupEnd();
    return (res, { timeElapsed }) => {
      console.groupCollapsed(
        `Dexie | ${tableName} [ Count ] (${timeElapsed.toFixed(
          1
        )} ms) <= Response`
      );
      console.log("-> Duration: " + timeElapsed + " ms");
      console.log(res);
      console.groupEnd();
    };
  },
};
