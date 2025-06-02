import Weapons from "../models/WeaponModel.js";
import Transactions from "../models/TransactionModel.js";

async function getWeapons(req, res) {
    try {
        const response = await Weapons.findAll();
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
    }
}

async function getWeaponById(req, res) {
    try {
        const response = await Weapons.findOne({where : {id : req.params.id}});
        res.status(200).json(response); 
    } catch (error) {
        console.log(error);
    }
}

async function addWeapons(req, res) {
    try {

        if (!['admin', 'petugas'].includes(req.user.role)) {
            return res.status(403).json({msg: "Only admin and petugas can add weapons"});
        }

        const {name, type, serialNum, condition, location, stok} = req.body;
        await Weapons.create({
            name : name,
            type : type,
            serialNum : serialNum,
            condition : condition,
            location : location,
            stok : stok
        });
        res.status(200).json({msg:"Data Senjata berhasil ditambahkan!"});
    } catch (error) {
        console.log(error.message);
        
    }
}

async function deleteWeapons(req, res) {
    try {
        const targetWeapon = req.params.id;
        await Transactions.destroy({where : {weaponId : targetWeapon}});
        await Weapons.destroy({where : {id: targetWeapon}});
        res.status(200).json({msg:"Data senjata berhasil dihapus!"});
    } catch (error) {
        console.log(error.message);
    }
}

async function updateWeapons(req, res) {
    try {
        const {name, type, serialNum, condition, location, stok} = req.body;
        const weaponId = req.params.id;
        let updateData = {
            name, type, serialNum, condition, location, stok
        };

        const result = await Weapons.update(updateData, {
            where : {
                id: weaponId
            }
        });

        if (result[0] === 0 ) {
            return res.status(404).json({
                status : 'Failed',
                messge : "Update data tidak berhasil",
                updateData : updateData,
                result
            });
        }
        res.status(200).json({msg:"Data berhasil di Update"});
    } catch (error) {
        console.log(error.message);
    }
}

export {getWeaponById, getWeapons, addWeapons, deleteWeapons, updateWeapons};