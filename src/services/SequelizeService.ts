import OrmConnection from "../models/config/OrmConnection";
import { OrmConnectionType } from "../models/config/OrmConnectionType";
const { Sequelize } = require('sequelize');
export default class SequelizeService
{
    sequelize:any;
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
    }
}