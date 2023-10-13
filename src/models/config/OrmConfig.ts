import { ModuleConfig, PackageIndex } from "@origamicore/core";
import TsOriORM from "../..";
import OrmConnection from "./OrmConnection";

export default class OrmConfig extends ModuleConfig
{
    async createInstance(): Promise<PackageIndex> {
        var instance=new TsOriORM();
        await instance.jsonConfig(this);
        return instance;
    } 
    connections:OrmConnection[]=[]
    public constructor(
        
        fields?: {
            id?:string
            name?: string,  
            connections:OrmConnection[]
        }) {

        super(fields);
        if (fields) Object.assign(this, fields);
    }
}