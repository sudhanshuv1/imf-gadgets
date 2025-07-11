import express from 'express';
const router = express.Router();
import { createUser, updateUser } from '../controllers/usersController';

router.route('/')
    .post(createUser)
    .patch(updateUser);

export default router;