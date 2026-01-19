
import imaps from 'imap-simple';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function debugInbox() {
    console.log("Debug: Connecting to Inbox...");

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("Missing EMAIL_USER or EMAIL_PASS");
        return;
    }

    const config = {
        imap: {
            user: process.env.EMAIL_USER as string,
            password: process.env.EMAIL_PASS as string,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
            authTimeout: 20000
        }
    };

    try {
        const connection = await imaps.connect(config);
        console.log("Debug: Connected. Opening INBOX...");

        await connection.openBox('INBOX');

        // Fetch only headers first to get UIDs
        const searchCriteria = ['ALL'];
        const fetchOptions = {
            bodies: ['HEADER'],
            markSeen: false
        };

        const messages = await connection.search(searchCriteria, fetchOptions);
        console.log(`Debug: Found ${messages.length} total messages.`);

        // Process last 50 messages
        const recentMessages = messages.slice(-50);
        console.log(`Debug: Scanning last ${recentMessages.length} messages...`);

        let found = false;

        for (const item of recentMessages) {
            const uid = item.attributes.uid;

            const headerPart = item.parts.find((part: any) => part.which === 'HEADER');

            if (headerPart && headerPart.body) {
                // imap-simple returns headers as an object map where keys are lowercased usually?
                // Or actually it returns raw parsed headers by `process-header-stream`? 
                // It depends on underlying `imap` module usage.
                // Usually `headerPart.body` has keys like `subject`, `from`, `date` which are arrays of strings.

                const subject = headerPart.body.subject ? headerPart.body.subject[0] : "No Subject";
                const from = headerPart.body.from ? headerPart.body.from[0] : "No Sender";
                const date = headerPart.body.date ? headerPart.body.date[0] : "No Date";

                // Check if it matches our interest
                if (from.includes("abhihulage14@gmail.com") || subject.includes("RFP")) {
                    found = true;
                    console.log("------------------------------------------------");
                    console.log(`MATCH FOUND [UID: ${uid}]`);
                    console.log("Subject:", subject);
                    console.log("From:", from);
                    console.log("Date:", date);
                }
            }
        }

        if (!found) {
            console.log("No matching emails found in the last 50 messages.");
        }

        console.log("Debug: Scan complete.");
        connection.end();
    } catch (error) {
        console.error("Debug Error:", error);
    }
}

debugInbox();
