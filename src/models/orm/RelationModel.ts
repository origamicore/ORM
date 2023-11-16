export default class RelationModel
{
    table1:string;
    table2:string;
    model:string
    key:string;
    title:string;
    init:boolean;
    public constructor(
        fields?: {
            table1:string;
            table2:string;
            key:string;
            title:string;
            init:boolean;
            model?:string
        }) {
        if (fields) Object.assign(this, fields);
    }

}