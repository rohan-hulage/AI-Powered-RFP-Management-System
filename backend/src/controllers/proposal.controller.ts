import { Request, Response } from 'express';
import { compareProposalsForRFP } from '../services/proposal.service';
import prisma from '../lib/prisma';

export const getProposalsByRFP = async (req: Request, res: Response) => {
    try {
        const { rfpId } = req.params;
        if (!rfpId || typeof rfpId !== 'string') return res.status(400).json({ error: 'Invalid RFP ID' });

        const proposals = await prisma.proposal.findMany({
            where: { rfpId },
            include: { vendor: true }
        });
        res.json(proposals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch proposals' });
    }
};

export const compareProposals = async (req: Request, res: Response) => {
    try {
        const { rfpId } = req.params;
        if (!rfpId || typeof rfpId !== 'string') return res.status(400).json({ error: 'Invalid RFP ID' });

        const result = await compareProposalsForRFP(rfpId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to compare proposals' });
    }
};
