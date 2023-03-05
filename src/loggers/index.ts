import { DBCoreTable } from "dexie";

type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never;

export type Operation = Exclude<keyof DBCoreTable, "schema" | "name">;

export interface LoggingReqProps {
  tableName: string;
}

export interface LoggingResProps {
  timeElapsed: number;
}

export type ReqForOperation<operation extends Operation> = Parameters<
  DBCoreTable[operation]
>["0"];
export type ResForOperation<operation extends Operation> = Unpromise<
  ReturnType<DBCoreTable[operation]>
>;

export type ResponseLoggingCallback<operation extends Operation> = (
  res: ResForOperation<operation>,
  props: LoggingResProps
) => void;

export type LoggingCallbacks = {
  [operation in Operation]?: (
    req: ReqForOperation<operation>,
    props: LoggingReqProps
  ) => ResponseLoggingCallback<operation>;
};

export { defaultLoggingCallbacks } from "./default";
export { minimalLoggingCallbacks } from "./minimal";
