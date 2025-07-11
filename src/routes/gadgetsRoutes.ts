import express from 'express';
const router = express.Router();
import { createGadget, getAllGadgets, updateGadget, removeGadget, selfDestructGadget } from '../controllers/gadgetsController';
import verifyJWT from '../middleware/verifyJWT'

router.use(verifyJWT);

router.route('/')
    .get(getAllGadgets)
    .post(createGadget)
    .patch(updateGadget)

router.route('/:id')
    .delete(removeGadget)

router.route('/:id/self-destruct')
    .post(selfDestructGadget)

export default router;