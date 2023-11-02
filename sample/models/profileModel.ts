import { OriProps,IOriModel, OriModel } from "@origamicore/core"; 
import { OrmModel, OrmProps } from "../..";
@OrmModel()
@OriModel({})
export default class ProfileModel extends IOriModel
{
    @OriProps({})
    @OrmProps({primaryKey:true})
    _id:string; 
    @OrmProps()
    @OriProps({})
    firstName:string;
    @OrmProps()
    @OriProps({})
    lastName:string;
    @OrmProps()
    age:number; 
    constructor(
        fields?: {
            _id?:string
            firstName?: string
            lastName?: string
            age?:number 
        })
    {
        super();  
        if (fields) 
        { 
            
            Object.assign(this, fields); 
        }
    }
}