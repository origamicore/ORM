import { MessageModel, OdataModel, OdataResponse, Router, SelectModel, SortModel } from "@origamicore/core";
import MergeService from "./MergeService";
import LocalSearchModel from "../models/orm/localSearchModel";
import OrmContainer, { OrmClass } from "../models/orm/OrmContainer";
import TransactionModel, { TransactionType } from "../models/orm/TransactionModel";
import TransactionService from "./Transaction";
import IncludeModel from "../models/orm/IncludeModel";
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
    static async syncDatabase(context:string)
    {
        var data= await Router.runInternal('orm','syncDatabase',new MessageModel({data:{
            context:context, 
        }}))
        return data.response.data;  

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
            include?:IncludeModel[]
        },odata?:OdataModel

    ):Promise<OdataResponse<T>>
    {  
        let mselect=MergeService.mergeSelect(fields?.select,odata?.$select) 
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
                include:fields.include
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
            return new OdataResponse(this.cls,{value:list,count:rsep.count})
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
    async UpdateOne(condition:any,
        fields?: {
            set?:any,
            inc?:any,
            push?:any
        }
        ):Promise<any>
    { 
        
       var data= await Router.runInternal('orm','updateOne',new MessageModel({data:{
            context:this.context,
            table:this.table,
             condition:MergeService.mergeWhere(condition,null),
             set:fields?.set?this.copy(fields.set):null,
             inc:fields?.inc,
             push:fields?.push
        }}))
        return data.response.data; 
    }
    async UpdateMany(condition:any,
        fields?: {
            set?:any,
            inc?:any, 
        }
        ):Promise<any>
    { 
        
       var data= await Router.runInternal('orm','updateMany',new MessageModel({data:{
            context:this.context,
            table:this.table,
             condition:MergeService.mergeWhere(condition,null),
             set:fields?.set?this.copy(fields.set):null,
             inc:fields?.inc, 
        }}))
        return data.response.data; 
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

    
     DeleteOneTrx(condition:any):any
    {   
        return new TransactionModel({
            type:TransactionType.Delete,
            condition:MergeService.mergeWhere(condition,null), 
            table:this.table,  
            context:this.context
        })
    }
    DeleteManyTrx(condition:any):any
    {   
        return new TransactionModel({
            type:TransactionType.DeleteMany,
            condition:MergeService.mergeWhere(condition,null), 
            table:this.table,  
            context:this.context
        })
    }
    UpdateOneTrx(condition:any,
        fields?: {
            set?:any,
            inc?:any,
            push?:any
        }
        ):any
    {  
        return new TransactionModel({
            type:TransactionType.Update,
            table:this.table, 
            document:{
                set:fields?.set?this.copy(fields.set):null,
                inc:fields?.inc,
                push:fields?.push
            }, 
            context:this.context,
            condition:MergeService.mergeWhere(condition,null),
        }) 
    }
    
    UpdateManyTrx(condition:any,
        fields?: {
            set?:any,
            inc?:any, 
        }
        ): any 
    { 
        
        return new TransactionModel({
            type:TransactionType.UpdateMany,
            table:this.table, 
            document:{
                set:fields?.set?this.copy(fields.set):null,
                inc:fields?.inc 
            }, 
            context:this.context,
            condition:MergeService.mergeWhere(condition,null),
        }) 
    }
    InsertOneTrx(document:T): TransactionModel 
    { 
        var copy= this.copy(document); 
        return new TransactionModel({
            type:TransactionType.Insert,
            table:this.table, 
            document:copy, 
            context:this.context
        })
    }
    
    InsertManyTrx(documents:T[]):TransactionModel
    { 
        var copy= this.copy(documents); 
        return new TransactionModel({
            type:TransactionType.InsertMany,
            table:this.table, 
            document:copy, 
            context:this.context
        })
    }
    saveByIdTrx(document:T):TransactionModel
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
        return new TransactionModel({
            type:TransactionType.Save,
            table:this.table, 
            document:copy,
            condition, 
            context:this.context
        })
    }
    static transaction(name:string)
    {
        return new TransactionService(name)
    }
}