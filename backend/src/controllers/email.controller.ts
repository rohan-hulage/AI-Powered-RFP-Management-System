import { Request, Response } from 'express';
import { checkEmailsForProposals, sendRFPToVendors } from '../services/email.service';

export const sendRFP = async (req: Request, res: Response) => {
    try {
        const { rfpId, vendorIds } = req.body;
        if (!rfpId || !vendorIds || !Array.isArray(vendorIds)) {
            return res.status(400).json({ error: 'rfpId and vendorIds (array) are required' });
        }

        const result = await sendRFPToVendors(rfpId, vendorIds);
        res.json({ message: 'Sending process completed', result });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send emails' });
    }
};

export const checkInbox = async (req: Request, res: Response) => {
    try {
        const processed = await checkEmailsForProposals();
        res.json({ message: 'Inbox checked', processed });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check inbox' });
    }
};
