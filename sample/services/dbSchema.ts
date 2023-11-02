import { OrmRouter } from "../..";
import ProfileModel from "../models/profileModel";

export default class DbSchema
{
    static profile:OrmRouter<ProfileModel>;
    static async init(context:string)
    {
        this.profile=await OrmRouter.create(context,'profile',ProfileModel)
    }
}