import { DataTypes } from "sequelize";

export default class OrmCommon
{
    static getSequelizeType(type:string)
    {
        if(type=='BOOLEAN')return DataTypes.BOOLEAN; 
        if(type=='BIGINT')return DataTypes.BIGINT; 
        if(type=='CHAR')return DataTypes.CHAR; 
        if(type=='DECIMAL')return DataTypes.DECIMAL; 
        if(type=='DOUBLE')return DataTypes.DOUBLE; 
        if(type=='FLOAT')return DataTypes.FLOAT; 
        if(type=='INTEGER')return DataTypes.INTEGER; 
        if(type=='JSON')return DataTypes.JSON; 
        if(type=='NOW')return DataTypes.NOW; 
        if(type=='TEXT')return DataTypes.TEXT; 
        if(type=='UUID')return DataTypes.UUID; 
        if(type=='DATE')return DataTypes.DATE;  
    }  
    static convertType(type:string):'BIGINT'|'BOOLEAN'|'CHAR'|'DECIMAL'|'DOUBLE'|'FLOAT'|'INTEGER'|'JSON'|'NOW'|'TEXT'|'UUID'|'DATE'
    { 
        if(type=='Boolean')return 'BOOLEAN';
        if(type=='String')return 'TEXT';
        if(type=='Date')return 'DATE';
        if(type=='Number')return 'INTEGER';
        return 'JSON'
    }
}