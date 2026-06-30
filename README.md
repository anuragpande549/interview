# AI Mock Interview Platform

A full-stack, dynamic AI mock interview platform where candidates have a real-time voice conversation with an AI interviewer. Built with Next.js, Node.js (Express), PostgreSQL, and Vapi.

## Local Setup in Under 5 Commands

Prerequisites: Node.js 18+ and a running PostgreSQL instance.

**1. Copy Environment Variables**
Copy the `.env.example` files to `.env` in both folders and fill in your database URL and API keys (Vapi Public/Private Keys, and Gemini/OpenAI API Key).
```bash
cp server/.env.example server/.env && cp client/.env.example client/.env
```

**2. Install Dependencies (Both Client and Server)**
```bash
npm install --prefix server && npm install --prefix client
```

**3. Setup Database (Prisma)**
Ensure your `DATABASE_URL` is correct in `server/.env`, then push the schema:
```bash
npx prisma db push --schema=server/prisma/schema.prisma
```

**4. Start the Backend Server**
```bash
npm --prefix server run start
# OR: cd server && node index.js
```

**5. Start the Frontend Client (in a new terminal)**
```bash
npm --prefix client run dev
```

That's it! Open `http://localhost:3000` to start practicing interviews.

---

## Architecture & Product Decisions

1. **Next.js & Vanilla CSS (Frontend)**: Followed the strict requirement to avoid Tailwind CSS and instead implemented a dynamic, premium UI using CSS modules and smooth transitions.
2. **Node.js Express & Prisma (Backend)**: ES Modules used in the backend for modern imports. Handled Auth via JWT. Prisma ensures type-safe and reliable DB queries.
3. **Vapi (Voice Engine)**: Chose Vapi for the "managed voice AI service" because it natively maintains the conversation history, supports dynamic prompting on the fly (to adjust for interview type), and provides a robust WebRTC Web SDK out-of-the-box.
4. **LLM Feedback**: When the call ends, the transcript is passed to the backend, which generates a comprehensive, formatted feedback report using an LLM (Gemini/OpenAI) and stores it in PostgreSQL.
