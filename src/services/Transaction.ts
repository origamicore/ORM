import { MessageModel, Router } from "@origamicore/core";
import TransactionModel from "../models/orm/TransactionModel";

export default class TransactionService
{
    name:string;
    models:TransactionModel[]=[]
    constructor(name:string )
    {
        this.name=name; 
    }
    add(model:TransactionModel|TransactionModel[])
    {
        if(Array.isArray(model))
        {
            this.models.push(...model); 
        }
        else
        {
            this.models.push(model); 
        }
        return this;
    }
    async run()
    {
        if(!this.models?.length) throw 'You must create at least one transaction'
        let context=this.models[0].context;
        let otherContext=this.models.filter(p=>p.context!=context)[0];
        if(otherContext) throw 'All contexts must be the same';
        var data= await Router.runInternal('orm','transaction',new MessageModel({data:{
            context:context, 
            documents:this.models, 
        }}))
    }
}