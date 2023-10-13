import { OrmConnectionType } from "./OrmConnectionType";

export default class OrmConnection
{
    type:OrmConnectionType=OrmConnectionType.SqlServer;
    username:string;
    password:string;
    host:string='localhost';
    dbName:string;
    port:number;
    context:string
    constructor(data:{
        type?:OrmConnectionType;
        username?:string;
        password?:string;
        host?:string;
        dbName?:string;
        port?:number;
        context:string

    })
    {
        Object.assign(this,data)
    }
    static createMemorySqlite(context:string):OrmConnection
    {
        return new OrmConnection({context});
    }
    static createSqlite(context:string,filePath:string):OrmConnection
    {
        return new OrmConnection({context,host:filePath});
    }
    static create(data:{
        type:OrmConnectionType;
        username?:string;
        password?:string;
        host?:string;
        dbName:string;
        port?:number;
        context:string
    }):OrmConnection
    {
        return new OrmConnection(data);
    }
}