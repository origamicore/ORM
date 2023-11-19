export default class ChildModel
{
    col:string;
    table:string;
    sync:boolean=true;
    // type:any;
    constructor(data:{
        table:string;
        col?:string;
        sync?:boolean;
        // type:any;
    })
    {
        Object.assign(this,data)
    }

}