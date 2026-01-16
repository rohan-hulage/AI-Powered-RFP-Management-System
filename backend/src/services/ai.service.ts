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
