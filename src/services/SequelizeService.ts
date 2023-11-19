import { ModelService } from "@origamicore/core";
import OrmConnection from "../models/config/OrmConnection";
import { OrmConnectionType } from "../models/config/OrmConnectionType";
import OrmContainer, { OrmClass } from "../models/orm/OrmContainer";
import { DataTypes, Model } from "sequelize";
import OrmCommon from "../models/OrmCommon"; 
import LocalSearchModel from "../models/orm/localSearchModel"; 
import RelationModel from "../models/orm/RelationModel";
import ActionModel, { ActionType } from "../models/orm/ActionModel";
const { Sequelize } = require('sequelize');
class CountryModel 
{ 
    _id:number;   
    name:string; 
    constructor(
        fields?: {
            _id?:number
            name?: string 
        })
    { 
        if (fields) 
        { 
            
            Object.assign(this, fields); 
        }
    }
}

export default class SequelizeService
{
    sequelize:any;
    tables:Map<string,any>=new Map<string,any>();
    tablesClass:Map<string,OrmClass>=new Map<string,OrmClass>();
    types:Map<string,string>=new Map<string,string>();
    relations:RelationModel[]=[]
    includes:Map<string,any>=new Map<string,any>()
    includesForSearch:Map<string,any>=new Map<string,any>()
    constructor(config:OrmConnection)
    {
        if(config.type==OrmConnectionType.Sqlite)
        {
            if(config.host)
            {
                this.sequelize = new Sequelize({
                    dialect: 'sqlite',
                    storage: config.host
                  });
            }
            else
            {
                this.sequelize = new Sequelize('sqlite::memory:') 
            }
        }
        else
        {
            let dialect:string;
            if(config.type==OrmConnectionType.BariaDB)dialect='mariadb';
            if(config.type==OrmConnectionType.MySql)dialect='mysql';
            if(config.type==OrmConnectionType.Oracle)dialect='oracle';
            if(config.type==OrmConnectionType.Postgres)dialect='postgres';
            if(config.type==OrmConnectionType.SqlServer)dialect='mssql'; 
            this.sequelize = new Sequelize(config.dbName,config.username, config.password, {
                host: config.host,
                dialect  
              });
        }
        this.init()
    } 

    async init()
    {
        try {
            await this.sequelize.authenticate();
            console.log('Connection has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
        let testmodel:any={}
          
           
    }
    toModel(data:any)
    {
        let temp=data
        if(data.dataValues)
        {
            temp=data.dataValues;
        }
        else 
        {
            if(!Array.isArray(temp))
                return data
        }
        if(!Array.isArray(temp))
            for(let dt in temp)
            {
                if(temp[dt])
                    temp[dt]=this.toModel(temp[dt])
            }
        else
            for(let i=0;i<temp.length;i++)
            {
                temp[i]=this.toModel(temp[i])
            }    
        return temp;
    }
    findInclude(table:string,search:boolean=false)
    {
        if(search)
        {
            let include= this.includesForSearch.get(table)
            if(include)return include;
            this.includesForSearch.set(table,this.getInclude(table,true))
            return this.includesForSearch.get(table) 
        }
        else
        {
            let include= this.includes.get(table)
            if(include)return include;
            this.includes.set(table,this.getInclude(table))
            return this.includes.get(table) 
        }
    }
    getInclude(table:string,all:boolean=false )
    {
        let include:any[]=[]
        let relations = this.relations.filter(p=>p.table1==table && (p.isChild|| all));
        if(relations.length)
        {
            for(let relation of relations)
            {
                if(!relation.relation1)throw ''
                let subInclude= this.getInclude(relation.table2)
                if(subInclude.length)
                {
                    include.push({
                        association:relation.relation1,
                        include:subInclude
                    })
                }
                else
                {
                    include.push(relation.relation1)  
                    
                }
            }
        }
        return include;
    }
    getId( table:string)
    {
        let omodel=  this.tablesClass.get(table)
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
    async findAll(table:string,option:LocalSearchModel):Promise<any>
    { 
        let tb= this.tables.get(table)
        if(tb)
        {
            let data:any[]=[]
            let rows:any[];
            let count:number;
            let find:any={} 
            if(option?.where) find.where=option.where
            if(option?.top) find.limit=option.top
            if(option?.skip) find.offset=option.skip
            if(option?.select) find.attributes=option.select;
            if(option?.selectGroup)
            {
                for(let group of option.selectGroup)
                {
                    let func:any;
                    if(group.func=='count')
                    {
                        func=this.sequelize.fn('COUNT',this.sequelize.col(group.name))
                    }
                    if(group.func=='sum')
                    {
                        func=this.sequelize.fn('SUM',this.sequelize.col(group.name))
                    }
                    if(group.title)
                    {
                        find.attributes.push([func,group.title]) 
                    }
                    else
                    {
                        find.attributes.push(func)  
                    }
                }
            }
            if(!find.attributes.length)delete find.attributes 
            
            let include=this.findInclude(table,true)
            if(include.length)
            {
                find.include=include

            }
            if(option?.count)
            {
                let dt=await tb.findAndCountAll(find)
                count=dt.count;
                rows = dt.rows;
            }
            else
            {
                rows=await tb.findAll(find)
            }
            for(let row of rows)
            { 
                data.push(this.toModel(row) )
            }
            return {value:data,count}
        }
        return null
    }
    async createUpdate(data:any,document:any,table:string):Promise< ActionModel[]>
    {
        
        let omodel= this.tablesClass.get(table)
        let transactions:ActionModel[]=[];
        let obj:any={}
        let keyId=this.getId(table)
        for(let prop of omodel.props)
        {
            if(prop.foreignKey)
            {
                
            }
            else if(prop.children)
            {
                if(prop.classType=='Array')
                {
                    if(prop.children.sync)
                    {
                        let id=this.getId(prop.children.table)
                        for(let dt of document[prop.name])
                        {
                            let exist=data[prop.name].filter(p=>p[id]==dt[id])[0]
                            if(exist)
                            {
                                transactions.push(...await this.createUpdate(exist,dt,prop.children.table)) 
                            }
                            else
                            {
                                transactions.push(new ActionModel({action:ActionType.Delete,model:dt}))
                               // await dt.destroy({transaction})
                            }
                        }
                        
                        let include=this.findInclude(prop.children.table)
                        let tb= this.tables.get(prop.children.table)
                        for(let dt of data[prop.name])
                        {
                            let exist=document[prop.name].filter(p=>p[id]==dt[id])[0];
                            if(!exist)
                            {
                                dt[prop.children.col]=data[keyId]
                                // await tb.create(dt,{include,transaction}) 
                                transactions.push(new ActionModel({action:ActionType.Create,model:tb,data:dt,include}))
                            }
                        }
     
                    }
                }
                else
                {
                    if(document[prop.name] && !data[prop.name])
                    {
                        transactions.push(new ActionModel({action:ActionType.Delete,model: document[prop.name]}))
                        // await document[prop.name].destroy({transaction}) 
                    }
                    else if(document[prop.name] && data[prop.name])
                    {
                        transactions.push(...await this.createUpdate(data[prop.name],document[prop.name],prop.children.table))

                    }
                    else if(!document[prop.name] && data[prop.name])
                    {
                        let include=this.findInclude(prop.children.table)
                        let tb= this.tables.get(prop.children.table)
                        data[prop.name][prop.children.col]=data[keyId]
                        transactions.push(new ActionModel({action:ActionType.Create,model: tb,data:data[prop.name],include}))
                        // await tb.create(data[prop.name],{include,transaction}) 
                        
                    }
                }
            }
            else
            {  
                document[prop.name]=data[prop.name]
            }
        } 
        
        transactions.push(new ActionModel({action:ActionType.Update,model: document}))
        // await document.save()
        return transactions
    }
    async saveById(table:string,data:any,condition:any):Promise<any>
    {
        let tb= this.tables.get(table)
        if(tb)
        { 
            let include=this.findInclude(table,true)
            let obj=await tb.findOne({where:condition,include} )
            if(!obj)
            {
                return await tb.create(data,{include}) 
            }
            else
            {
                let transaction = await this.sequelize.transaction();
                try{

                    
                    let list =await this.createUpdate(data, obj ,table)
                    let promiseArr=[]
                    for(let action of list)
                    {
                        if(action.action==ActionType.Create)
                        {
                            promiseArr.push(action.model.create(action.data,{include:action.include,transaction}) ) 
                        }
                        if(action.action==ActionType.Delete)
                        {
                            promiseArr.push(action.model.destroy({transaction}))  
                        }
                        if(action.action==ActionType.Update)
                        {
                            promiseArr.push(action.model.save({transaction}) ) 
                        }
                    }
                    await Promise.all(promiseArr)
                    await transaction.commit();

                }catch(exp){
                    await transaction.rollback();
                } 
            }
            
        }
        return null
        
    }
    async insertOne(table:string,data:any):Promise<any>
    {  
        let tb= this.tables.get(table)
        if(tb)
        {
             
            let include=this.findInclude(table)
            if(include.length)
            {
                return await tb.create(data,{include}) 
            }
            else
            {
                let obj=tb.build(data)
                return await obj.save()

            }


        }
        return null
        //const users = await testmodel.findAll();
 
    }
    async deleteOne(table:string,condition:any):Promise<any>
    {  
        let tb= this.tables.get(table)
        if(tb)
        {
            let obj=await tb.findOne({where:condition})
            if(obj)
            {
                return await obj.destroy()
            }
        }
        return null
        //const users = await testmodel.findAll();
 
    }
    async deleteMany(table:string,condition:any):Promise<any>
    {  
        let tb= this.tables.get(table)
        if(tb)
        { 
            return await tb.destroy({where:condition})
        }
        return null
        //const users = await testmodel.findAll();
 
    }
    async insertMany(table:string,data:any):Promise<any>
    {  
        let tb= this.tables.get(table)
        if(tb)
        {
            let obj=await tb.bulkCreate(data)
            return  obj 
        }
        return null
        //const users = await testmodel.findAll();
 
    }
    async test()
    {
        let sequelize=this.sequelize
        class Product extends Model {}
            Product.init({
            title: Sequelize.STRING
            }, { sequelize, modelName: 'product' });
            class User extends Model {}
            User.init({
            firstName: Sequelize.STRING,
            lastName: Sequelize.STRING
            }, { sequelize, modelName: 'user' });
            class Address extends Model {}
            Address.init({
            type: DataTypes.STRING,
            line1: Sequelize.STRING,
            line2: Sequelize.STRING,
            city: Sequelize.STRING,
            state: Sequelize.STRING,
            zip: Sequelize.STRING,
            }, { sequelize, modelName: 'address' });

            // We save the return values of the association setup calls to use them later
            Product['User'] = Product.belongsTo(User); 
            User['Addresses'] = User.hasMany(Address,
                {
                    as:'addressx',
                    foreignKey:'userxid'
                });

            await this.sequelize.sync({ force: true });
           let x=await Product.create({
                title: 'Chair',
                user: {
                  firstName: 'Mick',
                  lastName: 'Broadstone',
                  addressx: [{
                    type: 'home',
                    line1: '100 Main St.',
                    city: 'Austin',
                    state: 'TX',
                    zip: '78704'
                  }]
                }
              }, {
                include: [{
                  association: Product['User'],
                  include: [ User['Addresses'] ]
                }]
              });
              let rows:any=await Product.findAll({
                include: [{
                    association: Product['User'],
                    include: [ User['Addresses'] ]
                  }]
              })
              let json = JSON.stringify(rows[0].dataValues,null,4)
              console.log(json)
              let aa=0;
    }
    async initSchema(table:string,name:string)
    {
       // await this.test()
        let omodel= OrmContainer.models.filter(p=>p.name==name)[0]
        if(omodel)
        {
            this.tablesClass.set(table,omodel)
            let model=ModelService.getModel(omodel.name);
            let modelStructure:any={}
            if(!this.types.has(omodel.name))
            {
                this.types.set(omodel.name,table)
            }
            for(let prop of model.props)
            { 
                let oprop=omodel.props.filter(p=>p.name==prop.name)[0];
                let strType=''
                if(oprop?.type)
                {
                    strType=oprop?.type;
                }
                else
                {
                    strType=OrmCommon.convertType(prop.type)
                }
                if(oprop?.children)
                {
                    
                    this.relations.push(new RelationModel({
                        table1:table,
                        table2:oprop.children.table,
                        init:false,
                        key:oprop.children.col,
                        title:oprop.name, 
                        isChild:true,
                        sync:oprop.children.sync
                    }))
                }
                else if(oprop?.foreignKey)
                { 
                    let table2:string=''
                    let key='';
                    let model:string=''
                    if(typeof(oprop.foreignKey)=='string')
                    {
                        key=oprop.foreignKey
                        model=oprop.classType
                    }
                    else
                    {
                        key=oprop.foreignKey.col
                        table2=oprop.foreignKey.table;
                    }
                        this.relations.push(new RelationModel({
                            table1:table,
                            table2,
                            init:false,
                            key,
                            title:oprop.name,
                            model
                        }))
                    // modelStructure[prop.name]={
                    //     type: DataTypes.INTEGER,
                    //     references:{
                    //         model: models,
                    //         key: '_id',
                    //     }
                    // }
                    // let m=0;
                }
                else
                {
                    modelStructure[prop.name]={
                        type:OrmCommon.getSequelizeType(strType),
                        allowNull:!!prop.isRequired
                    }
                    if(oprop?.primaryKey)
                    {
                        modelStructure[prop.name].primaryKey=true
                    }
                    if(oprop?.autoIncrement)
                    {
                        modelStructure[prop.name].autoIncrement=true
                    }
                    if(oprop?.unique)
                    {
                        modelStructure[prop.name].unique=oprop.unique
                    }

                }
            }

            for(let oprop of omodel.props)
            {
                let prop=model.props.filter(p=>p.name==oprop.name)[0];
                if(prop)continue
                let strType=''

                if(oprop?.type)
                {
                    strType=oprop?.type;
                }
                else
                {
                    strType=OrmCommon.convertType(oprop.type)
                }
                let a=0;
                
                if(oprop?.children)
                {
                    
                    this.relations.push(new RelationModel({
                        table1:table,
                        table2:oprop.children.table,
                        init:false,
                        key:oprop.children.col,
                        title:oprop.name, 
                        isChild:true,
                        sync:oprop.children.sync
                    }))
                }
                else if(oprop?.foreignKey)
                { 
                    let table2:string=''
                    let key='';
                    let model:string=''
                    if(typeof(oprop.foreignKey)=='string')
                    {
                        key=oprop.foreignKey
                        model=oprop.classType
                    }
                    else
                    {
                        key=oprop.foreignKey.col
                        table2=oprop.foreignKey.table;
                    }
                    this.relations.push(new RelationModel({
                        table1:table,
                        table2,
                        init:false,
                        key,
                        title:oprop.name,
                        model
                    })) 
                }
                else
                {
                    modelStructure[oprop.name]={
                        type:OrmCommon.getSequelizeType(strType), 
                    }
                    if(oprop?.primaryKey)
                    {
                        modelStructure[oprop.name].primaryKey=true
                    }
                    if(oprop?.autoIncrement)
                    {
                        modelStructure[oprop.name].autoIncrement=true
                    }
                    if(oprop?.unique)
                    {
                        modelStructure[oprop.name].unique=oprop.unique
                    }

                }
            }

            for(let omodel of OrmContainer.models)
            {
                let children = omodel.props.filter(p=>p.children?.table==table)[0]
                if(children)
                {
                    // let key= omodel.getKey()
                    
                    // modelStructure[children.children.col]={
                    //     type:key.type,
                    //     allowNull:false,
                    //     references :{
                    //         model : omodel.name,
                    //         key:omodel.getKey().name
                    //     }
                    // } 
                }
            }
            let schema= this.sequelize.define(omodel.name,modelStructure,{tableName:table,timestamps: false})  
            this.tables.set(table,schema)

            for(let relation of this.relations)
            {
                if(relation.init) continue
                let table1 = this.tables.get(relation.table1);
                let table2:any ={}
                if(relation.table2)
                {
                    table2 = this.tables.get(relation.table2);
                }
                else
                {
                    table2 = this.tables.get(this.types.get(relation.model))
                }
                if(table2 && table1)
                {     
                    if(relation.isChild)
                    {
                        let ormModel=this.tablesClass.get(relation.table1);
                        let exist=ormModel.props.filter(p=>p.children?.table==relation.table2)[0];
                        if(exist.classType=='Array')
                        {
                            relation.relation1 = table1.hasMany(table2,{
                               as:relation.title,
                                foreignKey:relation.key, 
    
                            })
                        }
                        else
                        {
                            relation.relation1 = table1.hasOne(table2,{
                               as:relation.title,
                                foreignKey:relation.key, 
    
                            }) 
                        }
                        if(!relation.sync)
                        {
                            relation.relation2 = table2.belongsTo(table1)

                        }
                    }   
                    else
                    {
                        relation.relation1 = table1.belongsTo(table2,{
                            as:relation.title,
                            foreignKey:relation.key, 
                        })
                    }            
                    relation.init=true
    
                }

            }  
        }
        await this.sequelize.sync({ force: true });
    }
}