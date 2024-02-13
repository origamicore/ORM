import { ModelService, OriModel } from "@origamicore/core"; 
import { DataTypes } from "sequelize";
import OrmContainer from "./OrmContainer";
import OrmCommon from "../OrmCommon";
import ForeignKeyModel from "./ForeignKeyModel";
import ChildModel from "./ChildModel";
 
let temp:{name:string,foreignKey:ForeignKeyModel|string,propertyKey:string,target:any,active:boolean}[]=[]
function runTemp()
{
  for(let tmp of temp)
  {
    if(tmp.active)continue
    let foreignModel = OrmContainer.getModel(tmp.name);
    if(!foreignModel)continue
    let keyProp= foreignModel.getKey()
    let colName=typeof(tmp.foreignKey)=='string' ? tmp.foreignKey:tmp.foreignKey.col
    const getter = function() {
        return  this['@'+tmp.propertyKey];
    };
    const setter = function(newVal: any) {   
      if(newVal)this[colName]=newVal[keyProp.name]; 
      
      this['@'+tmp.propertyKey] = newVal;    
    }; 
    Object.defineProperty(tmp.target, tmp.propertyKey, {
        get: getter,
        set: setter
    });
    tmp.active=true

  }
}

interface Type<T> {
    new (...args: any[]): T;
  }
export function OrmModel (fields?: {  
} ) {
  return function <T>(target: Type<T> ) {   
    OrmContainer.addModel(target);
     runTemp()
  };
}



export function OrmProps(fields?: { 
    name?:string,
    primaryKey?:boolean
    autoIncrement?:boolean
    unique?:boolean|string
    foreignKey?:string|ForeignKeyModel
    children?:ChildModel
    type?:'BIGINT'|'BOOLEAN'|'CHAR'|'DECIMAL'|'DOUBLE'|'FLOAT'|'INTEGER'|'JSON'|'NOW'|'TEXT'|'UUID'|'DATE'
  })
{
    return function(target: Object, propertyKey: string) { 
      OrmContainer.target=target;
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
        if(fields?.children)
        {
          if(   !fields?.children.col)
          {
            if(t.name=='Array')
            {
              throw 'Enter the col'
            }
            else
            {
              fields.children.col='_id'
            }
          }
          let colName=  fields.children.col 
          // let childModel=OrmContainer.getModel(fields.children.type.name);
          // if(childModel)
          // {
          //   Object.defineProperty(target, colName, {
          //       get: function() {
          //         return  this['@'+colName];
          //     },
          //       set: function(newVal: any) {    
            
          //         this['@'+colName] = newVal;    
          //       }
          //   });

          // }
          const getter = function() {
            console.log('----------------------------------------------------------------');
              return  this['@'+propertyKey];
          };
          const setter = function(newVal: any) {    
            console.log('----------------------------------------------------------------',newVal);
            
            this['@'+propertyKey] = newVal;    
          }; 
          Object.defineProperty(target, propertyKey, {
              get: getter,
              set: setter
          });

        }
        if(fields?.foreignKey)
        {
          let foreignModel = OrmContainer.getModel(t.name);
          if(!foreignModel)
          {
            temp.push({
              name:t.name,
              foreignKey:fields.foreignKey,
              target,
              propertyKey,
               active:false
            })
            
          }
          else
          {
            let keyProp= foreignModel.getKey()
            let colName=typeof(fields.foreignKey)=='string' ? fields.foreignKey:fields.foreignKey.col
            const getter = function() {
                return  this['@'+propertyKey];
            };
            const setter = function(newVal: any) {   
              if(newVal)this[colName]=newVal[keyProp.name]; 
              
              this['@'+propertyKey] = newVal;    
            }; 
            Object.defineProperty(target, propertyKey, {
                get: getter,
                set: setter
            });

          }
        }
        if(fields?.foreignKey || fields?.children)
        { 
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
              if(prop.foreignKey || prop.children)
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
          classType:t.name,
          children:fields?.children
        })
    }

}