import prisma from '../lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

    Return ONLY valid JSON.
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });

        const choice = response.choices[0];
        const content = choice?.message?.content;
        if (!content) throw new Error("No content from AI");
        return JSON.parse(content);
    } catch (error) {
        console.error("Comparison Error:", error);
        throw new Error("Failed to compare proposals");
    }
};
