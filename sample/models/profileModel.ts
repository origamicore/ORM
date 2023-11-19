import { OriProps,IOriModel, OriModel } from "@origamicore/core"; 
import { OrmModel, OrmProps } from "../..";
import CountryModel from "./CountryModel";
import PhoneNumber from "./PhoneNumber";
import ForeignKeyModel from "../../src/models/orm/ForeignKeyModel";
import ChildModel from "../../src/models/orm/ChildModel";
import AddressModel from "./AddressModel";
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

    @OrmProps({children:new ChildModel({
        col:'profileId',
        table:'phoneNumbers', 
    })})
    phones:PhoneNumber[];

    @OrmProps({children:new ChildModel({ 
        table:'address', 
    })})
    address:AddressModel;

    constructor(
        fields?: {
            _id?:string
            firstName?: string
            lastName?: string
            age?:number 
            country?:CountryModel;
            phones?:PhoneNumber[]
            address?:AddressModel;
        })
    {
        super();  
        if (fields) 
        { 
            
            Object.assign(this, fields); 
        }
    }
}