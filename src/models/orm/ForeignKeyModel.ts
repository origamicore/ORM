export default class ForeignKeyModel
{
    table:string;
    col:string;
    ignore:string[]=[]
    constructor(data:{
        table:string;
        col:string;
        ignore?:string[]
    })
    {
        Object.assign(this,data)
    }
}