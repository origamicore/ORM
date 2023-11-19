import { MessageModel, OdataModel, OdataResponse, Router, SelectModel, SortModel } from "@origamicore/core";
import MergeService from "./MergeService";
import LocalSearchModel from "../models/orm/localSearchModel";
import OrmContainer, { OrmClass } from "../models/orm/OrmContainer";
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
    getId( )
    {
        let omodel= OrmContainer.models.filter(p=>p.name==this.modelName)[0]
        let idField='_id';
        if(omodel)
        {
            for(let prop of omodel.props)
            {
                if(prop.primaryKey)
                {
                    idField=prop.name;
                }
            }
        }
        return idField;
    }
    async saveById(document:T):Promise<any>
    {
        let idField= this.getId( )
        let condition:any={};
        let id=document[idField]
        if(id)
        {
            condition[idField] = id
        }
        else
        { 
            condition[idField] = {$eq:id}
        }
        var copy=this.copy(document);
         
        var copy= this.copy(document);
        var data= await Router.runInternal('orm','saveById',new MessageModel({data:{
            context:this.context,
            table:this.table,
            document:copy, 
            condition
         }}))
         return  data.response.data ; 

    }
    async findById(id:any):Promise<T>
    {
        let omodel= OrmContainer.models.filter(p=>p.name==this.modelName)[0]
        let idField='id';
        if(omodel)
        {
            for(let prop of omodel.props)
            {
                if(prop.primaryKey)
                {
                    idField=prop.name;
                }
            }
        }
        let where:any={};
        if(id)
        {
            where[idField] = id
        }
        else
        { 
            where[idField] = {$eq:id}
        }
         
        var data= await Router.runInternal('orm','findAll',new MessageModel({data:{
            context:this.context,
            table:this.table,
            serachModel:new LocalSearchModel({
                where:MergeService.mergeWhere(where,null)
            })  
        }}))
        if(data.response)
        {
            let rsep= data.response.data;
            if(rsep.value[0])
            {
                return new this.cls(rsep.value[0])
            }
            return null
        }
        throw data.error.message; 

    }
    async findAll(
        fields?: {
            where?: any
            select?: (string|SelectModel)[],
            sort?:SortModel[]
            limit?:number
            skip?:number
            showCount?:boolean
        },odata?:OdataModel

    ):Promise<OdataResponse<T>>
    {  
        let mselect=MergeService.mergeSelect(fields?.select,odata?.$filter)
        var data= await Router.runInternal('orm','findAll',new MessageModel({data:{
            context:this.context,
            table:this.table,
            serachModel:new LocalSearchModel({
                where:MergeService.mergeWhere(fields?.where,odata?.$filter),
                select:mselect.select,
                selectGroup:mselect.selectGroup,
                top:MergeService.mergeTop(fields?.limit,odata?.$top),
                skip:MergeService.mergeTop(fields?.skip,odata?.$skip),
                orders:MergeService.mergeOrder(fields?.sort,odata?.$orderby),
                count: (fields?.showCount || !!odata?.$count), 
            })  
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
    async DeleteOne(condition:any):Promise<any>
    {  
        var data= await Router.runInternal('orm','deleteOne',new MessageModel({data:{
            context:this.context,
            table:this.table,
            condition:MergeService.mergeWhere(condition,null), 
        }}))
        if(data.response)
        {
            return data.response.data; 

        }
        console.log(data.error.message);
        
        throw data.error.message; 
    }
    async DeleteMany(condition:any):Promise<any>
    {  
        var data= await Router.runInternal('orm','deleteMany',new MessageModel({data:{
            context:this.context,
            table:this.table,
            condition:MergeService.mergeWhere(condition,null), 
        }}))
        if(data.response)
        {
            return data.response.data; 

        }
        console.log(data.error.message);
        
        throw data.error.message; 
    }
    async findByIdAndDelete(id:any):Promise<any>
    { 
        let idField= this.getId( )
        let where:any={};
        if(id)
        {
            where[idField] = id
        }
        else
        { 
            where[idField] = {$eq:id}
        }

        var data= await Router.runInternal('orm','deleteOne',new MessageModel({data:{
            context:this.context,
            table:this.table,
            condition:MergeService.mergeWhere(where,null), 
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