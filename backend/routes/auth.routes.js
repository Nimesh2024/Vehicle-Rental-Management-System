import express from 'express';
import AuthController from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', AuthController.login);
router.get('/users', AuthController.getAllUsers);
router.post('/users', AuthController.createUser);
router.put('/users/:id', AuthController.updateUser);

export default router;
