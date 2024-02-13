export default class ForeignKeyModel
{
    table:string;
    col:string;
    ignore:string[]=[]
    treeName:string;
    deep:number;
    constructor(data:{
        table:string;
        col:string;
        ignore?:string[]
        treeName?:string;
        deep?:number;
    })
    {
        Object.assign(this,data)
    }
}