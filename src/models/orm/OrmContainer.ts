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
    primaryKey?:boolean
    autoIncrement?:boolean
    constructor(data:{
        name:string;
        type:string
        primaryKey?:boolean
        autoIncrement?:boolean
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
    static addModel(name:string)
    { 
        this.models.push(new OrmClass({name,props:this.props}))
        this.props=[]
    }
    static addProps(name:string,type:string,other:{
        primaryKey?:boolean
        autoIncrement?:boolean
    })
    {
        this.props.push(new OrmProp({name,type,primaryKey:other.primaryKey,autoIncrement:other.autoIncrement}))
    }
}