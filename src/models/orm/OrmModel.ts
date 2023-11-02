import { OriModel } from "@origamicore/core"; 
import { DataTypes } from "sequelize";
import OrmContainer from "./OrmContainer";
import OrmCommon from "../OrmCommon";
let types=['Boolean','Date','String','','',];
interface Type<T> {
    new (...args: any[]): T;
  }
export function OrmModel (fields?: {  
} ) {
  return function <T>(target: Type<T> ) {  
    OrmContainer.addModel(target.name);
     
  };
}



export function OrmProps(fields?: { 
    name?:string,
    primaryKey?:boolean
    autoIncrement?:boolean
    type?:'BIGINT'|'BOOLEAN'|'CHAR'|'DECIMAL'|'DOUBLE'|'FLOAT'|'INTEGER'|'JSON'|'NOW'|'TEXT'|'UUID'|'DATE'
  })
{
    return function(target: Object, propertyKey: string) { 
        var t = Reflect.getMetadata("design:type", target, propertyKey); 
        console.log('>>>',t.name,fields?.type);
        let type=fields?.type;
        if(!type && t.name)
        { 
          type= OrmCommon.convertType(t.name)
        }
        if(fields?.autoIncrement)
        {
          type='INTEGER'
        }
        OrmContainer.addProps((fields?.name)??propertyKey,type,{
          primaryKey:fields?.primaryKey,
          autoIncrement:fields?.autoIncrement
        })
    }

}