import { ModelService } from "@origamicore/core";
import OrmConnection from "../models/config/OrmConnection";
import { OrmConnectionType } from "../models/config/OrmConnectionType";
import OrmContainer from "../models/orm/OrmContainer";
import { DataTypes, Model } from "sequelize";
import OrmCommon from "../models/OrmCommon"; 
import LocalSearchModel from "../models/orm/localSearchModel"; 
import RelationModel from "../models/orm/RelationModel";
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
    types:Map<string,string>=new Map<string,string>();
    relations:RelationModel[]=[]

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

            find.include='country'
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
                data.push(row.dataValues)
            }
            return {value:data,count}
        }
        return null
    }
    async insertOne(table:string,data:any):Promise<any>
    {  
        let tb= this.tables.get(table)
        if(tb)
        {
            let obj=tb.build(data)
            return await obj.save()
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
    async initSchema(table:string,name:string)
    {
        let omodel= OrmContainer.models.filter(p=>p.name==name)[0]
        if(omodel)
        {
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
                if(oprop?.foreignKey)
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
                if(oprop?.foreignKey)
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
            let schema= this.sequelize.define(omodel.name,modelStructure,{tableName:table,timestamps: false})  
            this.tables.set(table,schema)

            for(let relation of this.relations)
            {
                if(relation.init) continue
                let table1 = this.tables.get(relation.table1);
                let table2 =''
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
                    table1.belongsTo(table2,{
                        as:relation.title,
                        foreignKey:relation.key, 
                    })
                    relation.init=true
    
                }

            }
        }
        await this.sequelize.sync({ force: true });
    }
}