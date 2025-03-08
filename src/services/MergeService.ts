import { SelectModel, SortModel } from "@origamicore/core";
import { Sequelize } from "sequelize";
const { Op } = require("sequelize");
var parser = require('odata-v4-parser');
export default class MergeService
{ 
    static methods(token)
    {
        if(token.method=="startswith")
        {
            var p=token.parameters
            var obj={
            }
            obj[this.convert(p[0])]={ 
                [Op.startsWith]  :  this.convert(p[1]) 
            } 
            return obj
        }
        if(token.method=="endswith")
        {
            var p=token.parameters
            var obj={}
            obj[this.convert(p[0])]={ 
                [Op.endsWith]  :  this.convert(p[1]) 
            }  
            return obj
        }
        if(token.method=="substringof")
        {//regex
            var p=token.parameters
            var obj={}
            obj[this.convert(p[1])]={
                [Op.substring]:this.convert(p[0])
            }
            return obj
        }
    }  
    static convert (token)
    {
        var obj={} 
        if(token.value)
        { 
            if(token.type=="Literal")
            {
                 if(token.value=="Edm.Boolean")
                 {

                     return  ( token.raw=='true')
                 }
                 if(token.value=="null")
                 {
                     return null
                 }
    
                 if(token.value=="Edm.SByte" || token.value=="Edm.Byte")
                 {
                     return parseInt(token.raw)
                 }
                 if(token.value=="Edm.Int16" || token.value=="Edm.Int32"||token.value=="Edm.Int64")
                 {
                     return parseInt(token.raw)
                 } 
    
    
            //Edm.DateTime
                 if(token.value=="Edm.Decimal"|| token.value=="Edm.Double"||token.value=="Edm.Single")
                 {
                     return parseFloat(token.raw)
                 }
    
                 if(token.value=="Edm.Guid")
                 {
                    return token.raw
                 }
                 if(token.value=="Edm.String")
                 {
                     return token.raw.substr(1,token.raw.length-2)
                 }
            }
            if(token.type=="MethodCallExpression")
            {
                return this.methods(token.value)
            }
            if(token.type=="ODataIdentifier")
            {
                return token.value.name
            }
            if(token.type=="AndExpression")
            {
                var cv=this.convert(token.value.right)
                var lf=this.convert(token.value.left) 
                return {[Op.and]:[lf,cv]}
            }
            
            if(token.type=="OrExpression")
            {
                var cv=this.convert(token.value.right)
                var lf=this.convert(token.value.left) 
                return {[Op.or]:[lf,cv]}
            }
            if(token.type=="EqualsExpression")
            {
                var s={}
                var cv=this.convert(token.value.right)
                var lf=this.convert(token.value.left) 
                    s[Op.eq]=cv
                    obj[lf] =s
                
            }
            if(token.type=="GreaterThanExpression")
            {
                var s={}
                var cv=this.convert(token.value.right)
                var lf=this.convert(token.value.left) 
                s[Op.gt]=cv
                obj[lf] =s
            }
            if(token.type=="GreaterOrEqualsExpression")
            {
                var s={}
                var cv=this.convert(token.value.right)
                var lf=this.convert(token.value.left) 
                    s[Op.gte]=cv
                    obj[lf] =s
                
            }
            if(token.type=="LesserThanExpression")
            {
                var s={}
                var cv=this.convert(token.value.right)
                var lf=this.convert(token.value.left) 
                    s[Op.lt]=cv
                obj[lf] =s
                
            }
            if(token.type=="LesserOrEqualsExpression")
            {
                var s={}
                var cv=this.convert(token.value.right)
                var lf=this.convert(token.value.left) 
                    s[Op.lte]=cv
                obj[lf] =s
                
            }
            if(token.type=="NotEqualsExpression")
            {
                var s={}
                var cv=this.convert(token.value.right)
                var lf=this.convert(token.value.left) 
                    s[Op.ne]=cv
                    obj[lf] =s
                
            }
             
            if(token.value.current)
            {
                let cv=this.convert(token.value.current)+'.'+this.convert(token.value.next)
               return   cv
            }
            if(token.type=="PropertyPathExpression"||
            token.type=="CommonExpression"||
            token.type=="MemberExpression"||
            token.type=="SingleNavigationExpression"||
            token.type=="FirstMemberExpression")
                return this.convert(token.value)
        }
        return obj
    }
    static createOdataFilter(data:any)
    {
        return this.convert(parser.filter(data)) ;
    }

    
    static objectToWhere(obj)
    {
        if( typeof(obj)!='object') return;
        
        for(var a in obj)
        {  
            if(obj[a] )
            {
                if(obj[a].$in){
                    obj[a][Op.in]=obj[a].$in
                    delete obj[a].$in 
                    return
                }
                let keys=Object.keys(obj[a])
                if(a.indexOf('.')>-1)
                { 
                    let val='';
                    if(typeof(obj[a])=='boolean' || typeof(obj[a])=='number'|| typeof(obj[a])=='string')
                    {
                        obj[Op.and]=[
                            Sequelize.literal(a+' = ' + JSON.stringify(obj[a]) )
                        ]
                        delete obj[a] 
                    }
                    else
                    {
                        throw 'Not Supported '
                    }
                    
                }
                else
                {

                    if(keys.indexOf('$eq')>-1)
                    {
                        obj[a][Op.eq]=obj[a].$eq
                        delete obj[a].$eq
                    } 
                    if(keys.indexOf('$gte')>-1)
                    {
                        obj[a][Op.gte]=obj[a].$gte
                        delete obj[a].$gte
                    } 
                    if(keys.indexOf('$gt')>-1)
                    {
                        obj[a][Op.gt]=obj[a].$gt
                        delete obj[a].$gt
                    } 
                    if(keys.indexOf('$lt')>-1)
                    {
                        obj[a][Op.lt]=obj[a].$lt
                        delete obj[a].$lt
                    } 
                    if(keys.indexOf('$lte')>-1)
                    {
                        obj[a][Op.lte]=obj[a].$lte
                        delete obj[a].$lte
                    } 
                }
            }



            if(obj[a] && obj[a].$bitAnd)
            {
                obj[a].$bitsAllSet=obj[a].$bitAnd
                delete obj[a].$bitAnd
            }
            if(obj[a] && obj[a].$bitNotAnd)
            {
                obj[a].$bitsAllClear=obj[a].$bitNotAnd
                delete obj[a].$bitNotAnd
            }
            if(obj[a] && obj[a].$bitOr)
            {
                obj[a].$bitsAnySet=obj[a].$bitOr
                delete obj[a].$bitOr
            }
            if(obj[a] && obj[a].$bitNoOr)
            {
                obj[a].$bitsAnyClear=obj[a].$bitNoOr
                delete obj[a].$bitNoOr
            }
            if(obj[a] && obj[a].$like)
            {
                let like=obj[a].$like
                delete obj[a].$like
                obj[a][Op.like]=like 
            }
        } 
        
        if(obj.$and)
        {
            for(var x of obj.$and)
            {
                this.objectToWhere(x)
            }
            obj[Op.and]=obj.$and
            delete obj.$and 
        }
        if(obj.$or)
        {
            for(var x of obj.$or)
            {
                this.objectToWhere(x)
            }
            obj[Op.or]=obj.$or
            delete obj.$or 
        }
    }

    static mergeWhere(where:any,odataFilter:string)
    {
        let filter:any=null;
        if(where)
        {
            this.objectToWhere(where)
        }
        if(odataFilter)
        {
            filter = this.createOdataFilter(odataFilter)
            if(where)
            {
                filter={[Op.and]:[
                    filter,
                    where
                ]}
            }
        }
        else
        {
            filter=where;
        }
        return filter;
    }
    static mergeSelect(selects?: (string|SelectModel)[],odataSelect?:string):{select:string[],selectGroup:SelectModel[]}
    {
        var select=[]
        var selectGroup:SelectModel[]=[]
        if(selects)
        { 
            for(var x of selects)
            {
                
                if(typeof(x)=='string')
                {
                    select.push(x)
                }
                else
                {
                    selectGroup.push(x)
                }
            } 
        } 
        if(odataSelect)
        {
            var tempssl=[]
            var sles=odataSelect.split(',')
            if(sles.length>0)
            {
                if(select.length)
                    for(let x of sles)
                    {
                        if(select.indexOf(x)>-1)
                            tempssl.push(x)
                    }
                else
                    tempssl=sles
                select=tempssl
            }
        } 
        return {select,selectGroup}
    }

    static mergeTop(limit?:number,top?:number)
    {
        if(limit && top) 
        {
            return Math.min(limit,top);
        }
        if(limit) return limit;
        if(top) return top;
    }
    static mergeOrder(sort?:SortModel[],odataOrder?:string)
    {
        var order:SortModel[]=[]
        if(odataOrder)
        {
            var ors=odataOrder.split(',')
            for(var a of ors)
            {
              var ord=a.split(' ')
              let type:'asc'|'desc' =ord[1].toLowerCase()=='asc'?'asc':'desc'
              if(ord.length>1)
              {
                order.push({name:ord[0],type})
              }
              else {
                order.push({name:a,type:"asc"}) 
              }
  
            } 

        }
        if(sort)
        {
            for(let a of sort)
              order.push(a);
        }
        return order
    } 
}