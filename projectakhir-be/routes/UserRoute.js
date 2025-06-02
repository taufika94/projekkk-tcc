import express from "express";
import {
    getUserById,
    getUsers,
    createUser,
    deleteUser,
    loginHandler,
    updateUser,
    logout,
} from  "../controllers/UserController.js";
import { verifyToken } from "../midleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";
import { checkRole, checkAdmin } from "../midleware/Authorization.js";

const router = express.Router();

//endpoint akses token
router.get ('/token', refreshToken);
//endpoint authenticate
router.post('/login', loginHandler);
router.delete('/logout', logout);
router.post('/register', createUser);
//endpoint khusus verify token
router.get('/users', verifyToken, checkAdmin, getUsers);
router.get('/users/:id', verifyToken, checkAdmin, getUserById);
router.post('/users/add', verifyToken, checkAdmin, createUser);
router.put('/update-user/:id', verifyToken, checkAdmin, updateUser);
router.delete('/delete-user/:id', verifyToken, checkAdmin, deleteUser);

export default router;



