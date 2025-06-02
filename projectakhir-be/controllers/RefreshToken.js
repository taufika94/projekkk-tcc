import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";

export const refreshToken = async(req,res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        console.log({refreshToken});
        
        if(!refreshToken) return res.sendStatus(401);

        console.log("Sudah lewat 401 di authController");

        const user = await User.findOne({
            where : {
                refreshToken:refreshToken,
            }
        });

        if(!user.refreshToken) return res.sendStatus(403);
        else jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,(err,decoded)=> {
            if(err) return res.sendStatus(403);
            console.log("Sudah lewat 403 ke dua di controller");
            const userPlain = user.toJSON(); //dikonversi ke object
            const {password: _, refreshToken: __, ...safeUserData} = userPlain;
            const accessToken = jwt.sign(safeUserData,process.env.ACCESS_TOKEN_SECRET, {
                expiresIn : '30s',
            });
            res.json({accessToken});
        });
    } catch (error) {
        console.log(error);
    }
};