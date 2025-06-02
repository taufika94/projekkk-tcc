import User from "../models/UserModel.js";
import Transactions from "../models/TransactionModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Transaction } from "sequelize";

//GET : mengambil data dari table user (findAll)
async function getUsers(req, res) {
    try {
        const response = await User.findAll();
        res.status(200).json(response);
        console.log("Data user berhasil diambil");
    } catch (error) {
        console.log(error.message);
    }
}

// GET BY ID : mengambil data dari table user berdasarkan userID (findOne)
async function getUserById(req, res) {
    try {
        const response = await User.findOne({where : {id : req.params.id }});
        res.status(200).json(response);
        console.log("User dengan", req.params.id, " berhasil diambil");
    } catch (error) {
        console.log(error);
    }
}

// POST : digunakan untuk user membuat atau mengirimkan data baru atau registrasi
async function createUser(req, res) {
    try {
       const {name, email, password, role} = req.body;

       const validRoles = ['admin', 'petugas', 'pengawas'];
        if (role && !validRoles.includes(role)) {
        return res.status(400).json({ 
            status: 'failed',
            message: 'Invalid role' 
        });
        }

        const encryptPassword = await bcrypt.hash(password, 5);
        await User.create({
            name : name,
            email : email,
            password : encryptPassword,
            role: role || 'petugas' // Default role petugas
        });
        res.status(200).json({msg:"Registrasi Berhasil!"});
    } catch (error) {
        console.log(error);
    }
}

async function updateUser(req, res) {
    try {
        // menangkap variable update dari request body
        const {name, email, password, role} = req.body;
        let updateData = {
            name, email, role
        } // data update disimpan pada variable object

        // mengubah update password menjadi hash sebelum dimasukan ke dalam database
        if (password) {
            const encryptPassword = await bcrypt.hash(password,5);
            //  masukan password yang sudah dalam bentuk hash ke object updateData
            updateData.password = encryptPassword;
        }

        // kemudian kirim ke database dengan update sesuai dengan params.id yang diterima
        const result = await User.update(updateData, {
            where : {
                id : req.params.id
            }
        });

        // mengecek apakah data berhasil terupdate atau tidak
        if (result[0] === 0 ) {
            return res.status(404).json({
                status : "failed",
                message : 'user tidak ditemukan atau tidak ada data yang berubah',
                updateData : updateData,
                result
            });
        }
        // jika data berhasil terupdate, maka kembalikan res.status(200)
        res.status(200).json(result);
        console.log("Data berhasil untuk diupdate!");
    } catch (error) {
        console.log(error);
    }
}

async function deleteUser(req, res) {
    try {
        const targetUser = req.params.id;

        //karena foreign key, maka pada tabel tarnsaksion harus dihapus dulu agar tidak error dalam database
        await Transactions.destroy({
            where : 
            {
                UserId : targetUser
            }
        });
        //setelah pada transaksi dihapus, maka hapus data user yang ingin dihapus
        await User.destroy({
            where : {
                id : targetUser
            }
        })

        res.status(200).json({msg:"User berhasil dihapus!"});
    } catch (error) {
        console.log(error);
    }
}

// Fungsi untuk login handler atau menangani login user
async function loginHandler(req, res) {
    try {
        const {email, password, role} = req.body;
        const user = await User.findOne({
            where :
            {
                email : email
            }
        });

        if (user) {
        //Data User itu nanti bakalan dipake buat ngesign token kan
        // data user dari sequelize itu harus diubah dulu ke bentuk object
        //Safeuserdata dipake biar lebih dinamis, jadi dia masukin semua data user kecuali data-data sensitifnya  karena bisa didecode kayak password caranya gini :
            const userPlain = user.toJSON(); // Konversi ke object
            const {password: _, refreshToken: __, ...safeUserData} = userPlain;

            //karena di db password dalam bentuk db, maka perlu di decrypt terlebih dahulu
            const decryptPassword = await bcrypt.compare(password, user.password);
            //decrypt password ini dikembalikan dalam bentuk bolean
            if (decryptPassword) {
                const accessToken = jwt.sign(safeUserData, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn : '30s',
                });
                const refresh_token = jwt.sign(safeUserData,process.env.REFRESH_TOKEN_SECRET, {
                    expiresIn : '1d',
                });
                //setelah membuat refresh token dan access token, maka kita update isi kolom resfresh token pada database
                await User.update({refreshToken:refresh_token}, {
                    where :
                    {
                        id: user.id,
                    }
                });

                res.cookie('refreshToken', refresh_token, {
                    httpOnly : false,
                    sameSite : 'none',
                    maxAge : 24*60*60*1000,
                    secure : true,
                });
                res.status(200).json({
                    status : "Success",
                    message : "Login Berhasil",
                    safeUserData,
                    accessToken,
                })
            }
            else {
                res.status(400).json({
                    status : 'failed',
                    message : "Password atau email salah!",
                });
            }
        } else {
            res.status(400).json({
                status : "Failed",
                message : "Password atau email salah!",
            })
        }
    } catch (error) {
        res.status(error.statusCode || 500).json({
            status : 'error',
            message : error.message,
        });
    }
}

async function logout(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;
        // mengecek refresh token sama atau tidak dengan di database
        if(!refreshToken) return res.sendStatus(204);
        const user = await User.findOne({
            where : {
                refreshToken : refreshToken,
            }
        });

        if(!user.refreshToken) return res.sendStatus(204);

        const userId = user.id;
        await User.update({refreshToken:null}, {
            where : {
                id : userId
            }
        });
        res.clearCookie('refreshToken'); // Menghapus cookie yang tersimpan
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
    }
}

export {getUsers,getUserById,loginHandler,deleteUser,logout,updateUser,createUser}