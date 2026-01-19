
import { checkEmailsForProposals } from '../services/email.service';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function verify() {
    console.log("Verifying email processing logic...");
    try {
        const results = await checkEmailsForProposals();
        console.log("Processing complete.");
        console.log("Results:", JSON.stringify(results, null, 2));
    } catch (error) {
        console.error("Verification failed:", error);
    }
}

verify();
