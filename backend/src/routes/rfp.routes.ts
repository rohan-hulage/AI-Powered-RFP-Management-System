import { Router } from 'express';
import { createRFP, getRFPById, getRFPs } from '../controllers/rfp.controller';

const router = Router();

router.post('/generate', createRFP);
router.get('/', getRFPs);
router.get('/:id', getRFPById);

export default router;
