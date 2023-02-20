import Dexie, { Table } from 'dexie';
import loggerMiddleware from 'dexie-logger'

export class CalendarDB extends Dexie {
  users!: Table<{ id: string; name: string }>;

  constructor() {
    super(`demo_db`);

    this.on.addEventType('update');

    this.middlewares();
    this.migrations();
  }

  middlewares() {
    // To add logs, simply add the table name to the tableWhiteList
    this.use(
      (loggerMiddleware as any)['dexie-logger']({
        tableWhiteList: ['users'],
        operationsBlackList: ['openCursor'],
      })
    );
  }

  migrations() {
    this.version(1).stores({
      users: '&id,name'
    });
  }
}

export const db = new CalendarDB();

