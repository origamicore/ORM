export enum ActionType
{
    Delete=1,
    Create=2,
    Update=3
}
export default class ActionModel
{
    model:any;
    action:ActionType
    data:any
    include:any
    constructor(data:{
        model:any;
        action:ActionType
        data?:any
        include?:any
    })
    {
        Object.assign(this,data)
    }
}