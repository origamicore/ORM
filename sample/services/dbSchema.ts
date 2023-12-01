import { OrmRouter } from "../..";
import AddressModel from "../models/AddressModel";
import CountryModel from "../models/CountryModel";
import PhoneNumber from "../models/PhoneNumber";
import ProfileModel from "../models/profileModel";

export default class DbSchema
{
    static profile:OrmRouter<ProfileModel>;
    static countrie:OrmRouter<CountryModel>;
    static phoneNumbers:OrmRouter<PhoneNumber>;
    static address:OrmRouter<AddressModel>;
    static async init(context:string)
    {
        this.countrie=await OrmRouter.create(context,'country',CountryModel)
        this.profile=await OrmRouter.create(context,'profile',ProfileModel)
        this.phoneNumbers=await OrmRouter.create(context,'phoneNumbers',PhoneNumber)
        this.address=await OrmRouter.create(context,'address',AddressModel)
        await OrmRouter.syncDatabase(context)
    }
}