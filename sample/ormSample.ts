import { OrmConfig, OrmConnection, OrmRouter } from "..";
import OrigamiCore, { ConfigModel } from "@origamicore/core"; 
import ProfileModel from "./models/profileModel";
import DbSchema from "./services/dbSchema";

export default class Sample
{
    constructor()
    {
        this.init()
    }
    
    async init()
    {
        var context='default';
        var config=new ConfigModel({
            packageConfig:[
                  new OrmConfig({ 
                      connections:[
                        OrmConnection.createMemorySqlite(context) 
                      ]
                  })
            ]
        });
        
        var origamicore = new OrigamiCore(config);
        await origamicore.start( )   
        await DbSchema.init(context)
        let res= await DbSchema.profile.InsertOne(new ProfileModel({
            _id:"1",
            age:12,
            firstName:"vahid",
            lastName:'hossaini'
        }))
        res= await DbSchema.profile.InsertOne(new ProfileModel({
            _id:"2",
            age:12,
            firstName:"vahid",
            lastName:'hossaini'
        }))
        console.log('>>>>>',res);
        res= await DbSchema.profile.findAll()
        console.log('>>>>>',res);
        

    }
}
new Sample()