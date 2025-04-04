import { OrmConfig, OrmConnection, OrmRouter } from "..";
import OrigamiCore, { ConfigModel, OdataModel, SortModel } from "@origamicore/core"; 
import ProfileModel from "./models/profileModel";
import DbSchema from "./services/dbSchema";
import CountryModel from "./models/CountryModel";
import PhoneNumber from "./models/PhoneNumber";
import AddressModel from "./models/AddressModel";
import IncludeModel from "../src/models/orm/IncludeModel";

function log(data:any)
{
    console.log(JSON.stringify(data,null,4)) 
}
export default class Sample
{
    constructor()
    {
       // this.transaction()
         this.init()
    }
    async transaction()
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
        await DbSchema.init(context);
        
        await DbSchema.countrie.InsertMany([
            new CountryModel({_id:1,name:"Iran"}),
            new CountryModel({_id:2,name:"Iraq"}),
            new CountryModel({_id:3,name:"India"}),
        ]) 

        await DbSchema.profile.InsertMany(
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
        console.log(await DbSchema.profile.findAll({sort:[new SortModel({name:'age',type:'desc'}),new SortModel({name:'firstName',type:'asc'})] }))

        // return
        let trx=OrmRouter.transaction('test')
        trx.add(
            DbSchema.countrie.InsertManyTrx([
                new CountryModel({_id:1,name:"Iran"}),
                new CountryModel({_id:2,name:"Iraq"}),
                new CountryModel({_id:3,name:"India"}),
            ])
        )
        trx.add(DbSchema.countrie.DeleteOneTrx({_id:1}))
        let resp=await trx.run()
        console.log(resp)
        console.log(await DbSchema.countrie.findAll())
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
        res=await DbSchema.countrie.findAll({},new OdataModel({$filter:'name eq \'\'',$count:true}));
        let profile=new ProfileModel({
            _id:"1",
            age:11,
            firstName:"vahid1",
            lastName:'hossaini1',
            country:new CountryModel({_id:1,name:"Iran"}),
            phones:[
                new PhoneNumber({phone:'+98',type:'Home'}),
                new PhoneNumber({phone:'+22',type:'Home'}),
            ],
            address:new AddressModel({adress:'Tehran'}), 
            // countryId:1

        })
        
         res= await DbSchema.profile.InsertOne(profile)
        res= await DbSchema.profile.InsertOne(new ProfileModel({
            _id:"2",
            age:12,
            firstName:"vahid2",
            lastName:'hossaini2',
            representative:profile

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
       // res= await DbSchema.profile.saveById(profile)
        res= await DbSchema.profile.findAll({ where:{_id:'2'},showCount:true})
        res= await DbSchema.profile.findAll({select:['_id','firstName','lastName','country'],where:{_id:'1'}})
        res= await DbSchema.profile.findAll({where:{
            $or:[
                {'phones.phone':'+98'},
                {_id:'4'}
            ]
            //SELECT `ProfileModel`.`_id`, `ProfileModel`.`firstName`, `ProfileModel`.`lastName`, `ProfileModel`.`country`, `country`.`_id` AS `country._id`, `country`.`name` AS `country.name` FROM `profile` AS `ProfileModel` LEFT OUTER JOIN `country` AS `country` ON `ProfileModel`.`countryId` = `country`.`_id` WHERE `ProfileModel`.`_id` = '1'
            //SELECT `ProfileModel`.`_id`, `ProfileModel`.`firstName`, `ProfileModel`.`lastName`, `ProfileModel`.`country`, `country`.`_id` AS `country._id`, `country`.`name` AS `country.name` FROM `profile` AS `ProfileModel` LEFT OUTER JOIN `country` AS `country` ON `ProfileModel`.`countryId` = `country`.`_id` WHERE `ProfileModel`.`_id` = '1';
        }})
        res= await DbSchema.phoneNumbers.findAll({})
        res= await DbSchema.profile.findAll({where:{_id:{$eq:'1'}}})
        res= await DbSchema.profile.findAll({where:{_id:{$eq:'1'}},include:[
            new IncludeModel({
                model:'country'
            })
        ]})
        await DbSchema.profile.UpdateOne({_id:'1'},{
            inc:{age:22},
            set:{firstName:'test update'},
            push:{
                phones:[
                    new PhoneNumber({phone:'+02',type:'Home'})
                ]
            }
        })
        profile= await DbSchema.profile.findById(profile._id)
        await DbSchema.profile.UpdateMany({$or:[{_id:'2'},{_id:'3'}]},{
            
            set:{firstName:'test update many'},
            inc:{age:12},
        })
        profile= await DbSchema.profile.findById('2')
        profile= await DbSchema.profile.findById('3')
        profile.age=123
      //  profile.phones[0].type='Work'
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

        OrmRouter.transaction('trx').add(DbSchema.profile.saveByIdTrx(profile))
    //     res= await DbSchema.profile.findById('3')
    //     console.log('>>>>>findById',res);
    //    res= await DbSchema.profile.findById('')
    //     console.log('>>>>>findById',JSON.stringify(res,null,4) );

    }
}
new Sample()