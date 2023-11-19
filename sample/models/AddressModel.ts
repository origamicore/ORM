import { OriProps,IOriModel, OriModel } from "@origamicore/core"; 
import { OrmModel, OrmProps } from "../..";
@OrmModel()
@OriModel({})
export default class AddressModel extends IOriModel
{ 
    @OrmProps({})
    adress:string; 
    constructor(
        fields?: { 
            adress?: string 
        })
    {
        super();  
        if (fields) 
        { 
            
            Object.assign(this, fields); 
        }
    }
}