import { MessageModel, OdataResponse, Router } from "@origamicore/core";

export default class OrmRouter<T>
{
    context:string;
    table:string; 
    modelName:string;
    private cls: { new(data:any): T };
    static async create<T>(context:string,table:string,cls: { new(data:any): T })
    {
        let instance=new OrmRouter(context,table,cls);
        instance.modelName= cls.name
        await instance.create()
        return instance;
    }
    constructor(context:string,table:string,cls: { new(data:any): T }){
        this.context=context;
        this.table=table;
        this.cls=cls;
    }  
    async create()
    {  
        var data= await Router.runInternal('orm','initSchema',new MessageModel({data:{
            context:this.context,
            table:this.table, 
            name:this.modelName
        }}))
        return data.response.data;  
    }
    copy(data:any)
    {
        return JSON.parse(JSON.stringify(data));
    }
    async findAll():Promise<OdataResponse<T>>
    { 
        var data= await Router.runInternal('orm','findAll',new MessageModel({data:{
            context:this.context,
            table:this.table,
        }}))
        if(data.response)
        {
            let rsep= data.response.data;
            let list:T[]=[]
            for(let row of rsep.value)
            {
                list.push(new this.cls(row))
            }
            return new OdataResponse(this.cls,{value:list})
        }
        throw data.error.message; 
    }
    async InsertOne(document:T):Promise<any>
    { 
        var copy= this.copy(document);
        var data= await Router.runInternal('orm','insertOne',new MessageModel({data:{
            context:this.context,
            table:this.table,
            document:copy, 
        }}))
        if(data.response)
        {
            return data.response.data; 

        }
        console.log(data.error.message);
        
        throw data.error.message; 
    }
    async InsertMany(documents:T[]):Promise<any>
    { 
        var copy= this.copy(documents);
        var data= await Router.runInternal('orm','insertMany',new MessageModel({data:{
            context:this.context,
            table:this.table,
            documents:copy, 
        }}))
        return data.response.data; 
    }

}