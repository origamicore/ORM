import { ModelService, OriModel } from "@origamicore/core"; 
import { DataTypes } from "sequelize";
import OrmContainer from "./OrmContainer";
import OrmCommon from "../OrmCommon";
import ForeignKeyModel from "./ForeignKeyModel";
let types=['Boolean','Date','String','','',];
interface Type<T> {
    new (...args: any[]): T;
  }
export function OrmModel (fields?: {  
} ) {
  return function <T>(target: Type<T> ) {   
    OrmContainer.addModel(target);
     
  };
}



export function OrmProps(fields?: { 
    name?:string,
    primaryKey?:boolean
    autoIncrement?:boolean
    unique?:boolean|string
    foreignKey?:string|ForeignKeyModel
    type?:'BIGINT'|'BOOLEAN'|'CHAR'|'DECIMAL'|'DOUBLE'|'FLOAT'|'INTEGER'|'JSON'|'NOW'|'TEXT'|'UUID'|'DATE'
  })
{
    return function(target: Object, propertyKey: string) { 
        var t = Reflect.getMetadata("design:type", target, propertyKey); 
        console.log('>>>',t.name,fields?.type);
        let type=fields?.type;
        if(propertyKey=='country')
        {
          let x=0;
        }
        if(!type && t.name)
        { 
          type= OrmCommon.convertType(t.name)
          
        }
        if(fields?.autoIncrement)
        {
          type='INTEGER'
        }
        if(fields?.foreignKey)
        {
          let colName=typeof(fields.foreignKey)=='string' ? fields.foreignKey:fields.foreignKey.col
          const getter = function() {
              return  this['@'+propertyKey];
          };
          const setter = function(newVal: any) {   
            this[colName]=newVal._id
            console.log('---------------------', this[colName]);
            
            this['@'+propertyKey] = newVal;    
          }; 
          Object.defineProperty(target, propertyKey, {
              get: getter,
              set: setter
          }); 
          target['toJSON']=function(){
            var copy:any={};
            for(let prop in this)
            { 
                if(prop[0]=='@')continue;
                copy[prop]=this[prop]
            }         
            var model=ModelService.getModel(this.constructor.name)
            for(let prop of model.props)
            { 
                if(prop.readOnly)
                {
                    copy[prop.name]=prop.readOnly(this);
                }
                else
                {
                    copy[prop.name]=this['@'+prop.name];
                }
            } 
            let ormModels=OrmContainer.getModel(this.constructor.name)
            for(let prop of ormModels.props)
            {  
                copy[prop.name]=this['@'+prop.name]; 
            } 
            return  copy;
          }
        }
        OrmContainer.addProps((fields?.name)??propertyKey,type,{
          foreignKey:fields?.foreignKey,
          unique:fields?.unique,
          primaryKey:fields?.primaryKey,
          autoIncrement:fields?.autoIncrement,
          classType:t.name
        })
    }

}