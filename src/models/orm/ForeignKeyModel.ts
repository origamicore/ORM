export default class ForeignKeyModel
{
    table:string;
    col:string;
    constructor(data:{
        table:string;
        col:string;
    })
    {
        Object.assign(this,data)
    }
}