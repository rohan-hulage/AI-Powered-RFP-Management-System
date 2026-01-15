import { Router } from 'express';
import { compareProposals, getProposalsByRFP } from '../controllers/proposal.controller';

const router = Router();

router.get('/:rfpId', getProposalsByRFP);
router.get('/:rfpId/compare', compareProposals);

export default router;
