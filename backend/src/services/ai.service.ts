import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export const parseRFPRequirements = async (userInput: string) => {
    const prompt = `
    You are an AI procurement assistant.
    Extract the following fields from the user's description into a valid JSON object:
    - title (short summary)
    - description (full description)
    - budget (extract the numeric text or say 'Not specified')
    - delivery_date (extract or 'Not specified')
    - items: array of objects { name, quantity, specs }

    User Input: "${userInput}"
    
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
        console.error("AI Parsing Error:", error);
        throw new Error("Failed to parse RFP requirements");
    }
};

export const parseVendorResponse = async (emailContent: string) => {
    const prompt = `
    You are an AI procurement assistant.
    Analyze the following email response from a vendor and extract structured data into a valid JSON object:
    - vendor_name (if inferred)
    - price_quote (total amount or detailed breakdown)
    - delivery_timeline
    - warranty_info
    - payment_terms
    - summary (2-3 sentences summarizing the proposal)

    Email Content:
    "${emailContent}"

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
        console.error("AI Parsing Error:", error);
        throw new Error("Failed to parse vendor response");
    }
}

export const compareProposals = async (oldContent: string, newContent: string, rfpContext: string): Promise<"KEEP_OLD" | "UPDATE_NEW"> => {
    const prompt = `
    You are a procurement expert.
    I have an existing proposal and a NEW proposal from the SAME vendor for the SAME RFP.
    Decide which one is "better" to keep in the system.
    
    RFP Context: "${rfpContext.substring(0, 500)}..." (truncated)

    EXISTING Proposal:
    "${oldContent.substring(0, 1000)}..."

    NEW Proposal:
    "${newContent.substring(0, 1000)}..."

    Criteria for "Better":
    1. Lower price (if quality is comparable).
    2. Clearer or faster delivery timeline.
    3. More specific warranty/payment terms.
    4. Completeness of response.
    
    Output ONLY the string "KEEP_OLD" or "UPDATE_NEW". Do not add any explanation.
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim().toUpperCase();

        if (text.includes("UPDATE_NEW")) return "UPDATE_NEW";
        if (text.includes("KEEP_OLD")) return "KEEP_OLD";

        // Default to updating if unclear, as new is usually more relevant
        return "UPDATE_NEW";
    } catch (error) {
        console.error("AI Comparison Error:", error);
        return "UPDATE_NEW"; // Fallback to newest
    }
};
