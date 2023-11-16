import { OrmConfig, OrmConnection, OrmRouter } from "..";
import OrigamiCore, { ConfigModel } from "@origamicore/core"; 
import ProfileModel from "./models/profileModel";
import DbSchema from "./services/dbSchema";
import CountryModel from "./models/CountryModel";

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
        await DbSchema.countrie.InsertMany([
            new CountryModel({_id:1,name:"Iran"}),
            new CountryModel({_id:2,name:"Iraq"}),
            new CountryModel({_id:3,name:"India"}),
        ])
        let res={}
        let profile=new ProfileModel({
            _id:"1",
            age:11,
            firstName:"vahid1",
            lastName:'hossaini1',
            country:new CountryModel({_id:1,name:"Iran"})
            // countryId:1
        })
        console.log('>>>>>findById',JSON.stringify(profile,null,4) );
        res= await DbSchema.profile.InsertOne(profile)
        res= await DbSchema.profile.InsertOne(new ProfileModel({
            _id:"2",
            age:12,
            firstName:"vahid2",
            lastName:'hossaini2'
        }))
        res= await DbSchema.profile.InsertMany(
            [
                new ProfileModel({
                    _id:"3",
                    age:13,
                    firstName:"vahid3",
                    lastName:'hossaini3'
                }),
                new ProfileModel({
                    _id:"4",
                    age:14,
                    firstName:"vahid4",
                    lastName:'hossaini4'
                }),
            ]
        )
        console.log('>>>>>',res);
        res= await DbSchema.profile.findAll({where:{_id:{$eq:'1'}}})
        console.log('>>>>>findById',JSON.stringify(res,null,4) );
    //     res= await DbSchema.profile.findById('3')
    //     console.log('>>>>>findById',res);
    //    res= await DbSchema.profile.findById('')
    //     console.log('>>>>>findById',JSON.stringify(res,null,4) );

    }
}
new Sample()