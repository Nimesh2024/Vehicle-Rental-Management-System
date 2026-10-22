import express from 'express';
import AuthController from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', AuthController.login);
router.get('/users', AuthController.getAllUsers);
router.post('/users', AuthController.createUser);
router.put('/users/:id', AuthController.updateUser);
router.delete('/users/:id', AuthController.deleteUser);

// Self-Profile & Security Management for all user types
router.get('/profile/:id', AuthController.getProfile);
router.put('/profile/:id', AuthController.updateProfile);
router.put('/change-password/:id', AuthController.changePassword);

export default router;
