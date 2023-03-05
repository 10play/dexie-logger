import { generateQueryRequestKey } from "..";
export const minimalLoggingCallbacks = {
    mutate: (req, { tableName }) => {
        return (_res, { timeElapsed }) => {
            console.log(`Dexie | ${tableName} [ Mutate - ${req.type} ] (${timeElapsed.toFixed(2)} ms)`);
        };
    },
    get: (req, { tableName }) => {
        return (_res, { timeElapsed }) => {
            console.log(`Dexie | ${tableName} [ Get - ${req.key} ] (${timeElapsed.toFixed(2)} ms)`);
        };
    },
    getMany: (_req, { tableName }) => {
        return (_res, { timeElapsed }) => {
            console.log(`Dexie | ${tableName} [ Get Many ] (${timeElapsed.toFixed(2)} ms)`);
        };
    },
    query: (req, { tableName }) => {
        return (_res, { timeElapsed }) => {
            console.log(`Dexie | ${tableName} [ Query -  ${generateQueryRequestKey(req.query)} ] (${timeElapsed.toFixed(2)} ms)`);
        };
    },
    openCursor: (req, { tableName }) => {
        return (_res, { timeElapsed }) => {
            console.log(`Dexie | ${tableName} [ Open Cursor -  ${generateQueryRequestKey(req.query)} ] (${timeElapsed.toFixed(2)} ms)`);
        };
    },
    count: (req, { tableName }) => {
        return (_res, { timeElapsed }) => {
            console.log(`Dexie | ${tableName} [ Count -  ${generateQueryRequestKey(req.query)} ] (${timeElapsed.toFixed(2)} ms)`);
        };
    },
};
