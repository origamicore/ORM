import {ModuleConfig, OriInjectable, PackageIndex} from '@origamicore/core'  
import OrmConfig from './models/config/OrmConfig';
@OriInjectable({domain:'orm'})
export default class TsOriORM implements PackageIndex
{
    name: string='orm'; 
    config:OrmConfig;
    jsonConfig(config: OrmConfig): Promise<void> {
         this.config=config ; 
        return;
    }
    async start(): Promise<void> { 

    }
    async restart(): Promise<void> {
    }
    async stop(): Promise<void> {
    }

}