# AI-Powered RFP Management System

This application simplifies and automates the procurement process using AI. It allows users to generate RFPs from natural language, manage vendors, send RFPs via email, parse vendor proposals automatically, and compare them using AI.

## Features

- **AI RFP Generation**: transform rough requirements into structured RFPs.
- **Vendor Management**: Maintain a list of vendors.
- **Email Integration**: Send RFPs to vendors and automatically parse their email replies.
- **AI Proposal Comparison**: Automatically extract data from proposals and rank/compare them.

## Tech Stack

- **Frontend**: React, one-way data flow, TailwindCSS.
- **Backend**: Node.js, Express, TypeScript, Prisma (SQLite).
- **AI**: OpenAI (GPT-4o-mini).
- **Email**: Nodemailer + IMAP.

## Setup

1.  **Clone the repository**.
2.  **Backend Setup**:
    ```bash
    cd backend
    npm install
    # Create .env based on .env.example
    npx prisma generate
    npx prisma db push
    npx ts-node src/seed.ts # Seed dummy vendors
    npm run dev
    ```
3.  **Frontend Setup**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
4.  **Access the App**:
    Open [http://localhost:5173](http://localhost:5173) in your browser.

## Environment Variables

See `.env.example` in both folders.