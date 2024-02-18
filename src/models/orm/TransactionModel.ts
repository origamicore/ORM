export enum TransactionType
{
    Update=1,
    UpdateMany=2,
    Delete=3,
    DeleteMany=4,
    Insert=5,
    InsertMany=6,
    Save=7
}
export default class TransactionModel
{
    type:TransactionType;  
    table:string;
    document:any;
    condition:any
    context:string;
    constructor(data:{
        type:TransactionType;  
        table:string;
        document?:any;
        condition?:any
        context:string;
    })
    {
        Object.assign(this,data)
    }
}