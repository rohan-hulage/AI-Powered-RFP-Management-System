
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';
import path from 'path';

// Load env from backend root
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

        // Search for ALL emails to see what's there, limit to last 5
        const searchCriteria = ['ALL'];
        const fetchOptions = {
            bodies: ['HEADER', 'TEXT'],
            markSeen: false
        };

        const messages = await connection.search(searchCriteria, fetchOptions);
        console.log(`Debug: Found ${messages.length} total messages.`);

        // Process last 5 messages
        const recentMessages = messages.slice(-5);

        for (const item of recentMessages) {
            const all = item.parts.find((part: any) => part.which === 'TEXT');

            if (all && all.body) {
                const parsed = await simpleParser(all.body);
                console.log("------------------------------------------------");
                console.log("Subject:", parsed.subject);
                console.log("From:", parsed.from?.value[0]?.address);
                console.log("Date:", parsed.date);
                console.log("Text Preview:", parsed.text?.substring(0, 100).replace(/\n/g, ' '));

                // Test regex match
                const subject = parsed.subject || '';
                const rfpIdMatch = subject.match(/RFP ID: ([a-zA-Z0-9-]+)/);
                console.log("RFP ID Match:", rfpIdMatch ? rfpIdMatch[1] : "NO MATCH");
            }
        }

        connection.end();
    } catch (error) {
        console.error("Debug Error:", error);
    }
}

debugInbox();
