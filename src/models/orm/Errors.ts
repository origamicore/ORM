import { ResponseErrorModel, RouteResponse } from "@origamicore/core";

export default class OrmErrors
{ 
    static connectionNotFound=new RouteResponse({error:new ResponseErrorModel({code:'orm001',message:'connection not found'})});
    static unknownError(exp:any):RouteResponse
    {
        console.log('----->',exp);
        
        return new RouteResponse({error:new ResponseErrorModel({code:'mongo001',message:'unknown',data:exp})});

    }
}