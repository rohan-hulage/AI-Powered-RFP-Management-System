import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

import vendorRoutes from './routes/vendor.routes';
import rfpRoutes from './routes/rfp.routes';
import emailRoutes from './routes/email.routes';
import proposalRoutes from './routes/proposal.routes';

app.use(cors());
app.use(express.json());

app.use('/api/vendors', vendorRoutes);
app.use('/api/rfps', rfpRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/proposals', proposalRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
