export default class RelationModel
{
    table1:string;
    table2:string;
    relation1:any;
    relation2:any
    model:string
    key:string;
    title:string;
    init:boolean;
    isChild:boolean;
    sync:boolean=false
    public constructor(
        fields?: {
            table1:string;
            table2:string;
            key:string;
            title:string;
            init:boolean;
            model?:string
            isChild?:boolean;
            sync?:boolean
        }) {
        if (fields) Object.assign(this, fields);
    }

}