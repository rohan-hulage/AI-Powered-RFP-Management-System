import { parseVendorResponse } from '../services/ai.service';
import dotenv from 'dotenv';
dotenv.config();

const runTest = async () => {
    try {
        console.log("Starting Multimodal Test...");

        // Valid 1x1 Red Dot PNG Base64
        const dummyImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

        const emailText = "Please find our proposal attached (image of quote).";

        const attachments = [
            { mimeType: 'image/png', data: dummyImageBase64 }
        ];

        console.log("Calling parseVendorResponse with dummy PNG...");
        const result = await parseVendorResponse(emailText, attachments);

        console.log("\n------ Result Validation ------");
        console.log(JSON.stringify(result, null, 2));

        if (result.price_quote || result.summary) {
            console.log("\n✅ SUCCESS: AI processed the request and returned structured data.");
        } else {
            console.log("\n❌ FAILURE: AI did not return expected structure.");
        }

    } catch (error) {
        console.error("\n❌ Test Failed:", error);
    }
}

runTest();
