import {Router} from 'express';
import {receiveWebhook} from '../controllers/formController.js';

const router = Router();

router.post('/', receiveWebhook);
export const formRouter = router;