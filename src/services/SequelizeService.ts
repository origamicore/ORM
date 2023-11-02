import { ModelService } from "@origamicore/core";
import OrmConnection from "../models/config/OrmConnection";
import { OrmConnectionType } from "../models/config/OrmConnectionType";
import OrmContainer from "../models/orm/OrmContainer";
import { DataTypes, Model } from "sequelize";
import OrmCommon from "../models/OrmCommon"; 
const { Sequelize } = require('sequelize');
 
export default class SequelizeService
{
    sequelize:any;
    tables:Map<string,any>=new Map<string,any>()
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
    async findAll(table:string):Promise<any>
    { 
        let tb= this.tables.get(table)
        if(tb)
        {
            let rows=await tb.findAll()
            let data:any[]=[]
            for(let row of rows)
            {
                data.push(row.dataValues)
            }
            return {value:data}
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
    async initSchema(table:string,name:string)
    {
        let omodel= OrmContainer.models.filter(p=>p.name==name)[0]
        if(omodel)
        {
            let model=ModelService.getModel(omodel.name);
            let modelStructure:any={}
            for(let prop of model.props)
            { 
                let strType=''
                let oprop=omodel.props.filter(p=>p.name==prop.name)[0];
                if(oprop?.type)
                {
                    strType=oprop?.type;
                }
                else
                {
                    strType=OrmCommon.convertType(prop.type)
                }
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
            }
            let schema= this.sequelize.define(omodel.name,modelStructure,{tableName:table})  
            this.tables.set(table,schema)
        }
        await this.sequelize.sync({ force: true });
    }
}