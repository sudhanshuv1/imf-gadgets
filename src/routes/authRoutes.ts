import express from 'express';
const router = express.Router();
const { login, refresh, logout } = require('../controllers/authController');
import verifyJWT from '../middleware/verifyJWT';

router.route('/')
    .post(login);

router.route('/refresh')
    .get(refresh);

router.use(verifyJWT);

router.route('/logout')
    .post(logout);

export default router;