import ForeignKeyModel from "./ForeignKeyModel";

interface Type<T> {
    new (...args: any[]): T;
  }
export class OrmClass
{  
    name:string;
    props:OrmProp[]=[]
    constructor(data:{
        name:string;
        props:OrmProp[] 
    })
    {
        Object.assign(this,data);
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
    constructor(data:{
        name:string;
        type:string
        foreignKey?:string|ForeignKeyModel
        primaryKey?:boolean
        autoIncrement?:boolean
        unique?:boolean|string
        classType?:string
    })
    {
        Object.assign(this,data);
    }
}
export default class OrmContainer
{
    static models:OrmClass[]=[]
    static props:OrmProp[]=[]
    static getModel(name:string):OrmClass
    {
        return this.models.filter(p=>p.name==name)[0]
    }
    static addModel<T>(target: Type<T>)
    { 
        this.models.push(new OrmClass({name:target.name,props:this.props}))
        this.props=[]
    }
    static addProps(name:string,type:string,other:{
        primaryKey?:boolean
        autoIncrement?:boolean
        unique?:boolean|string
        foreignKey?:string|ForeignKeyModel
        classType:string
    })
    {
        this.props.push(new OrmProp({name,type,primaryKey:other.primaryKey,autoIncrement:other.autoIncrement,unique:other.unique,foreignKey:other.foreignKey,classType:other.classType}))
    }
}