import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const DB_NAME = process.env.DB_NAME;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;

//menyambungkan ke database
const db = new Sequelize('gudangsenjata','root','',{
    host : 'localhost',
    dialect : "mysql"
});

export default db;