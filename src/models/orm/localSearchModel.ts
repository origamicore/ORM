import { SelectModel, SortModel } from "@origamicore/core";
import IncludeModel from "./IncludeModel";

 

export default class LocalSearchModel
{
    orders:SortModel[]=[]; 
    top:number;
    skip:number;
    where:any;
    selectGroup:SelectModel[];
    select:string[]=[]
    count:boolean;
    include:IncludeModel[];
    public constructor(
        fields?: {
            orders?:SortModel[]
            top?:number;
            skip?:number;
            where?:any;
            selectGroup?:SelectModel[];
            select?:string[]
            count?:boolean;
            include?:IncludeModel[];
        }) {
        if (fields) Object.assign(this, fields);
    }
}