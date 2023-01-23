var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const dexieLogger = (loggerProps) => {
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
            return Object.assign(Object.assign({}, downlevelDatabase), { table(tableName) {
                    const downlevelTable = downlevelDatabase.table(tableName);
                    return Object.assign(Object.assign({}, downlevelTable), { mutate: (req) => __awaiter(this, void 0, void 0, function* () {
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
                        }), get: (req) => __awaiter(this, void 0, void 0, function* () {
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
                        }), getMany: (req) => __awaiter(this, void 0, void 0, function* () {
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
                        }), query: (req) => __awaiter(this, void 0, void 0, function* () {
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
                        }), openCursor: (req) => __awaiter(this, void 0, void 0, function* () {
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
                        }), count: (req) => __awaiter(this, void 0, void 0, function* () {
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
                        }) });
                } });
        },
    };
};
//# sourceMappingURL=index.js.map