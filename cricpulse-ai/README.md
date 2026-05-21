# 🏏 CricPulse AI

![CricPulse Banner](https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop)

**CricPulse AI** is a high-throughput, hyper-immersive second-screen fan engagement platform built for IPL cricket. Designed with an EA Sports-style neon aesthetic, the platform merges real-time telemetry, gamification, and cutting-edge Google Gemini AI to transform how fans watch live sports.

Built specifically for high-scale serverless deployments on **Vercel**.

---

## ✨ Core Features

### 1. The Over Pulse (Gamified Prediction Engine)
* **What it is:** A sub-second gamification layer where users predict the precise outcome of the active delivery (Dot, Single, Boundary, Wicket).
* **How it works:** Driven by Firebase Realtime Database WebSockets. A cascading Streak Multiplier (1x → 2x → 5x) rewards consecutive correct guesses, paired with Framer Motion 3D tilt physics for an immersive UI experience.

### 2. Gemini Dugout (Context-Aware Tactical AI)
* **What it is:** An interactive, cheeky, stats-heavy tactical AI side-car for deep match analysis.
* **How it works:** Powered by **Google Gemini 1.5 Flash**. The backend Serverless Edge Route (`/api/chat`) dynamically intercepts user prompts and silently injects live match context (current batsman score, bowler economy rate) before hitting the LLM, ensuring highly specific, hallucination-free tactical answers.

### 3. Secure Fan Pods (AI Auto-Moderation)
* **What it is:** Live chat channels for rival team factions (e.g., GT vs CSK) that maintain a healthy banter environment.
* **How it works:** All messages are routed through an automated moderation pipeline. A serverless API instantly evaluates the text against a toxicity matrix using Gemini. If flagged, the message is instantly censored inline (`[Message removed by Auto-Moderator]`), ensuring thousands of fans can interact safely.

### 4. Contextual Flash-Merch (Real-Time Event Commerce)
* **What it is:** Ultra-scarcity, time-locked micro-offers tied to viral match highlights (e.g., *"Shubman Gill just hit a 50!"*).
* **How it works:** An automated state monitor listens for match milestone events and triggers aggressive countdown modal overlays, driving massive impulse conversions.

---

## 🛠️ Technical Stack & Architecture

* **Framework:** Next.js (App Router), React 18, TypeScript
* **Deployment:** Vercel (Edge Network & Serverless Functions)
* **Database & Sockets:** Firebase Realtime Database & Firestore
* **AI Integration:** Google Gemini API (`gemini-1.5-flash`)
* **Scraping Pipeline:** Firecrawl SDK (`@mendable/firecrawl-js`) + Vercel Cron Jobs
* **Design & Animations:** CSS Glassmorphism + Framer Motion 3D Physics

---

## 🚀 Installation & Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/taher51-lang/GDG_CricPulse.git
cd CricPulse
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory and populate it with the following credentials:

```env
# Google Gemini API
GEMINI_API_KEY="your_gemini_key_here"

# Firecrawl Scraper API
FIRECRAWL_API_KEY="your_firecrawl_key_here"

# Secure Cron Execution Secret (Generate a random string)
CRON_SECRET="my_secure_cron_password"

# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""
NEXT_PUBLIC_FIREBASE_DATABASE_URL="https://your-db.firebaseio.com"

# Firebase Admin Configuration (For Backend Cron Scraper)
FIREBASE_PROJECT_ID=""
FIREBASE_CLIENT_EMAIL=""
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 4. Start the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the application.

---

## ⚙️ Triggering the Live Data Pipeline (Hackathon Demo Mode)
By default, the dashboard will boot into a **"NO LIVE MATCH"** state to prevent hanging if Firebase is empty. To simulate a live match during a presentation, you must trigger the automated backend scraper cron job.

Open a new terminal window and run:
```bash
curl -X GET "http://localhost:3000/api/cron/scrape" \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
```
*Once triggered, the Vercel backend will scrape the latest telemetry, push it to Firebase, and the client dashboard will instantly hydrate via WebSockets with full 3D animations.*

---

## 🛡️ License
Built for the GDG Hackathon.
