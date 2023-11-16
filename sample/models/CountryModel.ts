import { OriProps,IOriModel, OriModel } from "@origamicore/core"; 
import { OrmModel, OrmProps } from "../..";
@OrmModel()
@OriModel({})
export default class CountryModel extends IOriModel
{
    @OriProps({})
    @OrmProps({primaryKey:true})
    _id:number;  
    @OriProps({})
    name:string; 
    constructor(
        fields?: {
            _id?:number
            name?: string 
        })
    {
        super();  
        if (fields) 
        { 
            
            Object.assign(this, fields); 
        }
    }
}