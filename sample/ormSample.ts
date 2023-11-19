import { OrmConfig, OrmConnection, OrmRouter } from "..";
import OrigamiCore, { ConfigModel } from "@origamicore/core"; 
import ProfileModel from "./models/profileModel";
import DbSchema from "./services/dbSchema";
import CountryModel from "./models/CountryModel";
import PhoneNumber from "./models/PhoneNumber";
import AddressModel from "./models/AddressModel";

function log(data:any)
{
    console.log(JSON.stringify(data,null,4)) 
}
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
            country:new CountryModel({_id:1,name:"Iran"}),
            phones:[
                new PhoneNumber({phone:'+98',type:'Home'})
            ],
            address:new AddressModel({adress:'Tehran'})
            // countryId:1

        })
        
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
         res= await DbSchema.profile.InsertOne(profile)
       // res= await DbSchema.profile.saveById(profile)
        res= await DbSchema.phoneNumbers.findAll({})
        res= await DbSchema.profile.findAll({where:{_id:{$eq:'1'}}})
        profile= await DbSchema.profile.findById(profile._id)
        profile.age=123
        profile.phones[0].type='Work'
        profile.phones.push(new PhoneNumber({phone:'+01',type:'None'})) 
        profile.phones.splice(0,1)
        //delete profile['@address'] ;
        profile.address=null;
        await DbSchema.profile.saveById(profile)
        res= await DbSchema.profile.findById(profile._id)
        res= await DbSchema.phoneNumbers.findAll({})
        log(res);
        // return
        res= await DbSchema.profile.DeleteOne({ _id:{$eq:'1' }})
        res= await DbSchema.phoneNumbers.findAll({})
        res= await DbSchema.profile.findAll({where:{_id:{$eq:'1'}}})
        //console.log('>>>>>findById',JSON.stringify(profile,null,4) );
        // console.log('>>>>>',res);
        res= await DbSchema.profile.findAll({where:{_id:{$eq:'4'}}})
        log(res);
        res= await DbSchema.profile.DeleteOne({ _id:{$eq:'4' }})
        log(res); 
        res= await DbSchema.profile.findAll({where:{_id:{$eq:'4'}}})
        log(res);
        res= await DbSchema.countrie.findAll({ })
        log(res); 
        let a=0;
    //     res= await DbSchema.profile.findById('3')
    //     console.log('>>>>>findById',res);
    //    res= await DbSchema.profile.findById('')
    //     console.log('>>>>>findById',JSON.stringify(res,null,4) );

    }
}
new Sample()