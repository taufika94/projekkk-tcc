import express from "express";
import {
    getTransaction,
    addTransaction,
    updateTransaction,
    getTransactionById
} from "../controllers/TransactionController.js";
import { verifyToken } from "../midleware/VerifyToken.js";
import { checkAdmin, checkPetugasAdmin, checkPengawas } from "../midleware/Authorization.js";

const router = express.Router();

// Pengawas can view
router.get('/transaction', verifyToken , getTransaction);
router.get('/transaction/:id', verifyToken, getTransactionById);
// Petugas can add
router.post('/add-transaction', verifyToken, checkPetugasAdmin, addTransaction);

// Admin can update
router.put("/transaction/:id", verifyToken, checkPetugasAdmin, updateTransaction);

export default router;