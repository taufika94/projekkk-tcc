import express from "express";
import cors from "cors";
import UserRoute from "./routes/UserRoute.js";
import WeaponRoute from "./routes/WeaponRoute.js";
import TransactionRoute from "./routes/TransactionRoute.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";


dotenv.config();

const app = express();
app.set("view engine", "");

app.use(cookieParser());
app.use(cors({ credentials:true,origin:[
  'http://localhost:5174'
]
 }));
app.use(express.json());
app.get("/", (req, res) => res.render("index"));
app.use(UserRoute, WeaponRoute, TransactionRoute);

app.listen(5000, () => console.log("Server connected"));
