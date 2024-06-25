interface QuickDB {
    target?: string | null;
    table?: string;
}

interface MongoOptions {
    url: string | null;
    schema?: string | null;
}

interface RethinkOptions {
    host: string;
    port: number;
    db?: string;
    user?: string;
    password?: string;
}

interface MySQLOptions {
    host: string;
    port: number;
    database?: string;
    user: string;
    password: string;
}

declare const ErenayDB: {
    setLanguage:(language:"tr"|"en") => true;
    setCheckUpdates:(boolean:boolean) => boolean;
    setReadable:(readable:boolean) => boolean;
    setNoBlankData:(noBlankData:boolean) => boolean;
    setAdapter:(adapter:"jsondb"|"localstorage"|"mongo"|"yamldb"|"rethink"|"mysql", options?: MongoOptions | RethinkOptions | MySQLOptions) => true;
    setFolder:(adapter:string) => true;
    setFile:(adapter:string) => true;
    
    set: (key: string, value: any) => any;
    delete: (key: string) => boolean;
    fetch: (key: string) => any;
    has: (key: string) => boolean;
    get: (key: string) => any;
    push: (key: string, value: any) => any[];
    unpush: (key: string, value: any) => any[];
    add: (key: string, value: number) => number;
    subtract: (key: string, value: number) => number;
    setByPriority: (key: string, value: any) => any;
    delByPriority: (key: string, value: any) => any;
    all: () => { [key: string]: any };
    deleteAll: () => boolean;
    moveToQuickDB: (QuickDB: QuickDB) => boolean;
    moveToMongoDB: (MongoDB: MongoOptions) => boolean;
    moveToRethinkDB: (RethinkDB: RethinkOptions) => boolean;
    moveToMySQL: (MySQLOptions: MySQLOptions) => boolean;
}

export = ErenayDB;
