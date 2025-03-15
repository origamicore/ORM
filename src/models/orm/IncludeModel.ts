export default class IncludeModel
{
    model:string;
    attributes:string[]
    constructor(data:{
        model:string;
        attributes?:string[]
    })
    {
        Object.assign(this,data)
    }
}