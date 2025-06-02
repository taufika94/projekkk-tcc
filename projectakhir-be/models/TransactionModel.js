import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "../models/UserModel.js";
import Weapons from "./WeaponModel.js";

const Transactions = db.define(
    "transactions", {
        type_transactions : {
            type : Sequelize.STRING,
        },
        amount : Sequelize.INTEGER,
        information : Sequelize.STRING,
        status : {
            type : Sequelize.ENUM('pending','approved','rejected'),
            defaultValue : 'pending'
        },
        userId : {
            type : Sequelize.INTEGER,
            allowNull:false,
        },
        weaponId : {
            type : Sequelize.INTEGER,
            allowNull:false,
        },
    },
    {
        freezeTableName : true,
        timestamps : true,
    }
);

Weapons.hasMany(Transactions, {foreignKey: "weaponId"});
Transactions.belongsTo(Weapons, {foreignKey : "weaponId"});

Users.hasMany(Transactions, {foreignKey: "userId"});
Transactions.belongsTo(Users, {foreignKey: "userId"});

db.sync().then(() => console.log("Database synced"));
export default Transactions;
