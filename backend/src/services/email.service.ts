import nodemailer from 'nodemailer';
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import prisma from '../lib/prisma';
import { parseVendorResponse } from './ai.service';

const transporter = nodemailer.createTransport({
    service: 'gmail', // Or use host/port from env
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendRFPToVendors = async (rfpId: string, vendorIds: string[]) => {
    const rfp = await prisma.rFP.findUnique({ where: { id: rfpId } });
    if (!rfp) throw new Error("RFP not found");

    const vendors = await prisma.vendor.findMany({
        where: { id: { in: vendorIds } }
    });

    const results = [];

    for (const vendor of vendors) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: vendor.email,
                subject: `RFP Invitation: ${rfp.title} (RFP ID: ${rfp.id})`,
                text: `Dear ${vendor.name},\n\nWe invite you to submit a proposal for the following RFP:\n\n${rfp.description}\n\nPlease reply to this email with your proposal.\n\nThank you.`
            };

            await transporter.sendMail(mailOptions);
            results.push({ vendor: vendor.email, status: 'sent' });
        } catch (error) {
            console.error(`Failed to send to ${vendor.email}`, error);
            results.push({ vendor: vendor.email, status: 'failed', error });
        }
    }
    return results;
};

export const checkEmailsForProposals = async () => {
    const config = {
        imap: {
            user: process.env.EMAIL_USER as string,
            password: process.env.EMAIL_PASS as string,
            host: 'imap.gmail.com', // Customize if needed
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
            authTimeout: 20000
        }
    };

    try {
        const connection = await imaps.connect(config);
        await connection.openBox('INBOX');

        // Search options: Look for emails from the last 48 hours to ensure we don't miss anything
        // but also don't overwhelm the connection by fetching thousands of emails.
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const searchCriteria = [['SINCE', twoDaysAgo]];

        const fetchOptions = {
            bodies: [''],
            markSeen: true
        };

        const messages = await connection.search(searchCriteria, fetchOptions);
        const processed = [];

        console.log(`Found ${messages.length} messages since ${twoDaysAgo.toDateString()}`);

        for (const item of messages) {
            const all = item.parts.find((part: any) => part.which === '');
            const id = item.attributes.uid;

            if (all && all.body) {
                const parsed = await simpleParser(all.body);
                const subject = parsed.subject || '';
                const fromEmail = parsed.from?.value[0]?.address;
                const textContent = parsed.text || '';

                // console.log(`Debug: Checking email "${subject}" from ${fromEmail}`);

                // Check if subject contains RFP ID (simplistic matching)
                const rfpIdMatch = subject.match(/RFP ID: ([a-zA-Z0-9-]+)/);

                if (rfpIdMatch) {
                    if (fromEmail) {
                        const rfpId = rfpIdMatch[1];
                        // Find Vendor
                        const vendor = await prisma.vendor.findUnique({ where: { email: fromEmail } });

                        if (vendor && rfpId) {
                            // Check for existing proposal
                            const existingProposal = await prisma.proposal.findFirst({
                                where: {
                                    rfpId: rfpId,
                                    vendorId: vendor.id
                                }
                            });

                            if (existingProposal) {
                                // If content is substantially the same, skip (optional optimization)
                                // For now, we assume if we got a new email, it might be an update.
                                // But to avoid processing the exact same email content repeatedly:
                                if (existingProposal.content === textContent) {
                                    console.log(`Skipping identical proposal content for RFP ${rfpId} from ${vendor.name}`);
                                    continue;
                                }

                                console.log(`Updating existing proposal for RFP ${rfpId} from ${vendor.name}`);

                                try {
                                    // Parse Proposal with AI
                                    const aiAnalysis = await parseVendorResponse(textContent);

                                    // Update Proposal
                                    await prisma.proposal.update({
                                        where: { id: existingProposal.id },
                                        data: {
                                            content: textContent,
                                            structuredResponse: JSON.stringify(aiAnalysis),
                                            summary: aiAnalysis.summary,
                                            updatedAt: new Date() // Explicitly update timestamp
                                        }
                                    });
                                    processed.push({ subject, from: fromEmail, status: 'updated' });
                                } catch (err) {
                                    console.error(`Failed to update proposal for RFP ${rfpId} from ${vendor.name}:`, err);
                                }
                            } else {
                                console.log(`Processing new proposal for RFP ${rfpId} from ${vendor.name}`);

                                try {
                                    // Parse Proposal with AI
                                    const aiAnalysis = await parseVendorResponse(textContent);

                                    // Save Proposal
                                    await prisma.proposal.create({
                                        data: {
                                            rfpId,
                                            vendorId: vendor.id,
                                            content: textContent,
                                            structuredResponse: JSON.stringify(aiAnalysis),
                                            score: 0, // Placeholder
                                            summary: aiAnalysis.summary
                                        }
                                    });
                                    processed.push({ subject, from: fromEmail, status: 'created' });
                                } catch (err) {
                                    console.error(`Failed to create proposal for RFP ${rfpId} from ${vendor.name}:`, err);
                                }
                            }
                        }
                    }
                }
            }
        }

        connection.end();
        return processed;
    } catch (error) {
        console.error("IMAP Error:", error);
        return [];
    }
};
