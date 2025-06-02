import express from "express";
import {
    getWeapons,
    getWeaponById,
    addWeapons,
    updateWeapons,
    deleteWeapons,
} from "../controllers/WeaponController.js";
import { verifyToken } from "../midleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";
import { checkRole, checkPetugasAdmin, checkAdmin } from "../midleware/Authorization.js"

const router = express.Router();

// Endpoint untuk token
router.get('/token', refreshToken);

// Pengawas can view
router.get('/weapons', verifyToken, getWeapons); // Bisa diakses semua role
router.get('/weapons/:id', verifyToken, getWeaponById); // Bisa diakses semua role

// Only admin can modify
router.post('/add-weapons', verifyToken, checkPetugasAdmin, addWeapons);
router.put('/update-weapons/:id', verifyToken, checkPetugasAdmin, updateWeapons);
router.delete('/delete-weapons/:id', verifyToken, checkPetugasAdmin, deleteWeapons);
export default router;