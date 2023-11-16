import { SelectModel, SortModel } from "@origamicore/core";

 

export default class LocalSearchModel
{
    orders:SortModel[]=[]; 
    top:number;
    skip:number;
    where:any;
    selectGroup:SelectModel[];
    select:string[]=[]
    count:boolean;
    public constructor(
        fields?: {
            orders?:SortModel[]
            top?:number;
            skip?:number;
            where?:any;
            selectGroup?:SelectModel[];
            select?:string[]
            count?:boolean;
        }) {
        if (fields) Object.assign(this, fields);
    }
}