import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { parseRFPRequirements } from '../services/ai.service';

export const createRFP = async (req: Request, res: Response) => {
    try {
        const { requirements } = req.body;
        if (!requirements) {
            return res.status(400).json({ error: 'Requirements are required' });
        }

        // 1. Parse requirements using AI
        const structuredData = await parseRFPRequirements(requirements);

        // 2. Create RFP in DB
        const rfp = await prisma.rFP.create({
            data: {
                title: structuredData.title || 'Untitled RFP',
                description: requirements,
                budget: structuredData.budget?.toString(),
                currency: 'USD', // Default
                timeline: structuredData.delivery_date,
                structuredData: JSON.stringify(structuredData),
                status: 'OPEN'
            }
        });

        res.status(201).json(rfp);
    } catch (error) {
        console.error("Create RFP Error:", error);
        res.status(500).json({ error: 'Failed to create RFP' });
    }
};

export const getRFPs = async (req: Request, res: Response) => {
    try {
        const rfps = await prisma.rFP.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { proposals: true }
                }
            }
        });
        res.json(rfps);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch RFPs' });
    }
};

export const getRFPById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string') {
            return res.status(400).json({ error: 'Invalid RFP ID' });
        }
        const rfp = await prisma.rFP.findUnique({
            where: { id },
            include: {
                proposals: {
                    include: { vendor: true }
                }
            }
        });

        if (!rfp) {
            return res.status(404).json({ error: 'RFP not found' });
        }
        res.json(rfp);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch RFP' });
    }
};
