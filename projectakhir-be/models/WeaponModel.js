import { Sequelize } from "sequelize";
import db from "../config/Database.js";

//
const Weapons = db.define(
    "weapons",
    {
        name : Sequelize.STRING,
        type : Sequelize.STRING,
        serialNum : {
            type : Sequelize.STRING, unique : true,
        },
        condition : Sequelize.STRING,
        location : Sequelize.STRING,
        stok : Sequelize.INTEGER,
    },
    {
        freezeTableName : true,
        timestamps : true,
    }
);
db.sync().then(() => console.log("Database synced"));
export default Weapons;