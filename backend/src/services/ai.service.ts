import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const parseRFPRequirements = async (userInput: string) => {
    const prompt = `
    You are an AI procurement assistant.
    Extract the following fields from the user's description into a JSON object:
    - title (short summary)
    - description (full description)
    - budget (extract the numeric text or say 'Not specified')
    - delivery_date (extract or 'Not specified')
    - items: array of objects { name, quantity, specs }

    User Input: "${userInput}"
    
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
        if (!content) throw new Error("No content received from AI");
        return JSON.parse(content);
    } catch (error) {
        console.error("AI Parsing Error:", error);
        throw new Error("Failed to parse RFP requirements");
    }
};

export const parseVendorResponse = async (emailContent: string) => {
    const prompt = `
    You are an AI procurement assistant.
    Analyze the following email response from a vendor and extract structured data into JSON:
    - vendor_name (if inferred)
    - price_quote (total amount or detailed breakdown)
    - delivery_timeline
    - warranty_info
    - payment_terms
    - summary (2-3 sentences summarizing the proposal)

    Email Content:
    "${emailContent}"

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
        if (!content) throw new Error("No content received from AI");
        return JSON.parse(content);
    } catch (error) {
        console.error("AI Parsing Error:", error);
        throw new Error("Failed to parse vendor response");
    }
}
