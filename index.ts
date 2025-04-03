import TsOriORM from "./src";
import OrmConfig from "./src/models/config/OrmConfig";
import OrmConnection from "./src/models/config/OrmConnection";
import { OrmConnectionType } from "./src/models/config/OrmConnectionType";
import ChildModel from "./src/models/orm/ChildModel";
import ForeignKeyModel from "./src/models/orm/ForeignKeyModel";
import IncludeModel from "./src/models/orm/IncludeModel";
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
    IncludeModel,
    ForeignKeyModel
}
export default TsOriORM;