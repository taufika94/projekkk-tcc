import Transactions from "../models/TransactionModel.js";
import Users from "../models/UserModel.js"; // Asumsikan path model pengguna Anda
import Weapons from "../models/WeaponModel.js"; 

//GET : mengambil semua data transaksi
async function getTransaction(req, res) {
    try {
        const response = await Transactions.findAll();
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
    }
}

async function getTransactionById(req, res) {
    try {
        const response = await Transactions.findOne({
            where: { id: req.params.id },
            include: [Users, Weapons] // Include relasi jika diperlukan
        });
        
        if (!response) {
            return res.status(404).json({ msg: "Transaction not found" });
        }
        
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Server error" });
    }
}

async function addTransaction(req, res) {
    try {
        // Only admin and petugas can add
        if (!['admin', 'petugas'].includes(req.user.role)) {
            return res.status(403).json({msg: "Unauthorized access"});
        }

        const {type_transactions, amount, information, status, userId, weaponId } = req.body;
        await Transactions.create({
            type_transactions,
            amount,
            information,
            status: req.user.role === 'petugas' ? 'pending' : status, // Petugas can only create pending
            userId,
            weaponId,
        });
        res.status(200).json({msg:"Data Transaksi berhasil ditambahkan!"});
    } catch (error) {
        console.log(error.message);
    }
}

async function updateTransaction(req, res) {
  try {
    const userRole = req.user.role;
    const transactionId = req.params.id;
    
    // Cari transaksi yang akan diupdate
    const transaction = await Transactions.findOne({
      where: { id: transactionId }
    });
    
    if (!transaction) {
      return res.status(404).json({ msg: "Transaction not found" });
    }
    
    // Validasi untuk petugas
    if (userRole === 'petugas') {
      const allowedFields = ['type_transactions', 'amount', 'information'];
      const updateData = {};
      
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
      
      // Update hanya field yang diizinkan
      await transaction.update(updateData);
    } else {
      // Admin bisa update semua field
      await transaction.update(req.body);
    }
    
    res.status(200).json({ msg: "Transaction updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
}

export {getTransaction, addTransaction, updateTransaction, getTransactionById};