import { OriProps,IOriModel, OriModel } from "@origamicore/core"; 
import { OrmModel, OrmProps } from "../..";
import CountryModel from "./CountryModel";
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
    @OriProps({})
    age:number; 

    // @OrmProps()
    // @OriProps({})
    // countryId:number; 
 
    @OrmProps({foreignKey:'countryId'})
    country:CountryModel;

    constructor(
        fields?: {
            _id?:string
            firstName?: string
            lastName?: string
            age?:number 
            country?:CountryModel;
        })
    {
        super();  
        if (fields) 
        { 
            
            Object.assign(this, fields); 
        }
    }
}