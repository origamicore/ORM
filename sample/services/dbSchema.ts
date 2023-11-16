import { OrmRouter } from "../..";
import CountryModel from "../models/CountryModel";
import ProfileModel from "../models/profileModel";

export default class DbSchema
{
    static profile:OrmRouter<ProfileModel>;
    static countrie:OrmRouter<CountryModel>;
    static async init(context:string)
    {
        this.countrie=await OrmRouter.create(context,'country',CountryModel)
        this.profile=await OrmRouter.create(context,'profile',ProfileModel)
    }
}