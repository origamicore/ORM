import {ModuleConfig, OriInjectable, OriService, PackageIndex, ResponseDataModel, RouteResponse} from '@origamicore/core'  
import OrmConfig from './models/config/OrmConfig';
import SequelizeService from './services/SequelizeService';
import OrmErrors from './models/orm/Errors';
@OriInjectable({domain:'orm'})
export default class TsOriORM implements PackageIndex
{
    name: string='orm'; 
    config:OrmConfig;
    private connections:Map<string,SequelizeService>=new Map<string,SequelizeService>();
    jsonConfig(config: OrmConfig): Promise<void> {
         this.config=config ; 
         for(let connection of config.connections)
         {
            this.connections.set(connection.context,new SequelizeService(connection))
         }
        return;
    }
    async start(): Promise<void> { 

    }
    async restart(): Promise<void> {
    }
    async stop(): Promise<void> {
    }
    
    @OriService({isInternal:true})
    async initSchema(context:string,table:string,name:string):Promise<RouteResponse>
    {
        var connection=this.connections.get(context);
        if(connection==null) return OrmErrors.connectionNotFound; 
        try{
            var data= await connection.initSchema(table,name); 
            return new RouteResponse({response:new ResponseDataModel({data:data})});
        }catch(exp){
            return OrmErrors.unknownError(exp);
        }
    }

    @OriService({isInternal:true})
    async insertOne(context:string,table:string,document:any):Promise<RouteResponse>
    {
        var connection=this.connections.get(context);
        if(connection==null) return OrmErrors.connectionNotFound; 
        try{
            var data= await connection.insertOne(table,document); 
            return new RouteResponse({response:new ResponseDataModel({data:data})});
        }catch(exp){
            return OrmErrors.unknownError(exp);
        }
    }
    @OriService({isInternal:true})
    async findAll(context:string,table:string):Promise<RouteResponse>
    {
        var connection=this.connections.get(context);
        if(connection==null) return OrmErrors.connectionNotFound; 
        try{
            var data= await connection.findAll(table); 
            return new RouteResponse({response:new ResponseDataModel({data:data})});
        }catch(exp){
            return OrmErrors.unknownError(exp);
        }
    }
    // @OriService({isInternal:true})
    // async insertMany(context:string,collection:string,documents:any):Promise<RouteResponse>
    // {
    //     var connection=this.connections.get(context);
    //     if(connection==null) return OrmErrors.connectionNotFound; 
    //     try{
    //         var data= await connection.insertMany(collection,documents); 
    //         return new RouteResponse({response:new ResponseDataModel({data:data})});
    //     }catch(exp){
    //         return OrmErrors.unknownError(exp);
    //     }
    // }
}