import ChildModel from "./ChildModel";
import ForeignKeyModel from "./ForeignKeyModel";

interface Type<T> {
    new (...args: any[]): T;
  }
export class OrmClass
{  
    target:any;
    name:string;
    props:OrmProp[]=[]
    constructor(data:{
        name:string;
        target:any;
        props:OrmProp[] 
    })
    {
        Object.assign(this,data);
    }
    getKey()
    { 
        return this.props.filter(p=>p.primaryKey)[0]; 
    }
}

export class OrmProp
{
    name:string;
    type:string
    foreignKey:string|ForeignKeyModel
    primaryKey?:boolean
    autoIncrement?:boolean
    unique?:boolean|string
    classType:string
    children?:ChildModel
    constructor(data:{
        name:string;
        type:string
        foreignKey?:string|ForeignKeyModel
        primaryKey?:boolean
        autoIncrement?:boolean
        unique?:boolean|string
        classType?:string
        children?:ChildModel
    })
    {
        Object.assign(this,data);
    }
}
export default class OrmContainer
{
    static models:OrmClass[]=[]
    static props:OrmProp[]=[]
    static target:any;
    static getModel(name:string):OrmClass
    {
        return this.models.filter(p=>p.name==name)[0]
    }
    static addModel<T>(target: Type<T>)
    { 
        if(!this.props.length)
        {
            throw 'At least one field is required'
        }
        let key=this.props.filter(p=>p.primaryKey)[0];
        if(!key)
        {
            this.props.push(new OrmProp({
                name:'_id',
                type:'INTEGER',
                autoIncrement:true,
                primaryKey:true
            }))
            Object.defineProperty(OrmContainer.target, '_id', {
                get: function() {
                  return  this['@_id' ];
              },
                set: function(newVal: any) {    
            
                  this['@_id' ] = newVal;    
                }
            });
            
        }
        // for(let parent of OrmContainer.models)
        // {
        //     let exist=parent.props.filter(p=>p.children?.type?.name==target.name)[0]
        //     if(exist)
        //     {
        //         let a=0;
        //         Object.defineProperty(OrmContainer.target, exist.children.col, {
        //             get: function() {
        //               return  this['@'+exist.children.col];
        //           },
        //             set: function(newVal: any) {    
                
        //               this['@'+exist.children.col] = newVal;    
        //             }
        //         });
    
        //     }
        // }
        this.models.push(new OrmClass({name:target.name,props:this.props,target:OrmContainer.target}))
        this.props=[]
    }
    static addProps(name:string,type:string,other:{
        primaryKey?:boolean
        autoIncrement?:boolean
        unique?:boolean|string
        foreignKey?:string|ForeignKeyModel
        classType:string
        children?:ChildModel
    })
    {
        this.props.push(new OrmProp({
            name,
            type,
            primaryKey:other?.primaryKey,
            autoIncrement:other?.autoIncrement,
            unique:other?.unique,
            foreignKey:other?.foreignKey,
            classType:other?.classType,
            children:other?.children
        }))
    }
}