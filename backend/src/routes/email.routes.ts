import { Router } from 'express';
import { checkInbox, sendRFP } from '../controllers/email.controller';

const router = Router();

router.post('/send', sendRFP);
router.post('/check', checkInbox);

export default router;
