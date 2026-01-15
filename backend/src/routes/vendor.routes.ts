import { Router } from 'express';
import { createVendor, getVendors } from '../controllers/vendor.controller';

const router = Router();

router.get('/', getVendors);
router.post('/', createVendor);

export default router;
