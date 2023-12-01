import TsOriORM from "./src";
import OrmConfig from "./src/models/config/OrmConfig";
import OrmConnection from "./src/models/config/OrmConnection";
import { OrmConnectionType } from "./src/models/config/OrmConnectionType";
import ChildModel from "./src/models/orm/ChildModel";
import ForeignKeyModel from "./src/models/orm/ForeignKeyModel";
import { OrmModel, OrmProps } from "./src/models/orm/OrmModel";
import OrmRouter from "./src/services/OrmRouter";

 
export {
    OrmConfig,
    OrmConnection,
    OrmConnectionType,
    OrmRouter,
    OrmModel,
    OrmProps,
    ChildModel,
    ForeignKeyModel
}
export default TsOriORM;