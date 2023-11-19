import { OriModel } from "@origamicore/core";
import { OrmModel, OrmProps } from "../..";

@OrmModel()
@OriModel({})
export default class PhoneNumber
{
    @OrmProps({})
    phone:string;
    @OrmProps({})
    type:string;
    constructor(data:{
        phone:string;
        type:string; 
    })
    {
        Object.assign(this,data)
    }
}