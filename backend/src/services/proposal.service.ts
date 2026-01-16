import prisma from '../lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const compareProposalsForRFP = async (rfpId: string) => {
    const proposals = await prisma.proposal.findMany({
        where: { rfpId },
        include: { vendor: true }
    });

    if (proposals.length === 0) return { error: "No proposals found" };

    const proposalsText = proposals.map((p, index) =>
        `Vendor: ${p.vendor.name}
         Proposal Summary: ${p.summary}
         Details: ${p.structuredResponse}
         Index: ${index}
        `
    ).join('\n\n');

    const prompt = `
    Compare the following proposals for an RFP.
    Rank them from best to worst based on cost, delivery time, and overall value.
    Provide a "recommendation" field with the best vendor's name and a "reasoning" field.
    Also provide a "comparison_table" array with columns: Vendor, Price, Timeline, Pros, Cons.

    Proposals:
    ${proposalsText}

    Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();

        // Cleanup markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(text);
    } catch (error) {
        console.error("Comparison Error:", error);
        throw new Error("Failed to compare proposals");
    }
};
