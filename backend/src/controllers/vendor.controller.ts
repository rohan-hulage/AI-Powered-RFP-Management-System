import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getVendors = async (req: Request, res: Response) => {
    try {
        const vendors = await prisma.vendor.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch vendors' });
    }
};

export const createVendor = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, address } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        const vendor = await prisma.vendor.create({
            data: { name, email, phone, address }
        });

        res.status(201).json(vendor);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Vendor with this email already exists' });
        }
        res.status(500).json({ error: 'Failed to create vendor' });
    }
};
