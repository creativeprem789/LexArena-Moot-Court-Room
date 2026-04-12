# Lex Arena: Moot Court Simulation 

Lex Arena is a professional-grade, AI-driven legal simulation platform designed for law students and practitioners in India. It simulates one of the most intellectually demanding environments: a **Supreme Court of India Moot Court**, where users argue cases against a highly-competitive AI Prosecution under the supervision of a Socratic AI Judge.

The platform is anchored in **Indian Constitutional Law**, providing a realistic, high-fidelity experience that bridges the gap between legal theory and professional court craft.

---

## Project Features
- **Dynamic AI Personas**: Specialized Gemini-powered AI agents acting as a neutral, analytical **Judge** and an aggressive, adversarial **Prosecution**.
- **Supreme Court RAG Engine**: A custom Retrieval-Augmented Generation system that fetches real Indian legal precedents to ground all arguments in judicial reality.
- **Real-Time Analytics**: A live "Argument Strength" tracker that evaluates your legal reasoning, constitutional grounding, and factual precision.
- **Professional Courtroom Logic**: Handles procedural interruptions, Socratic questioning, and nuanced legal rebuttals.
- **Indian Legal Context**: Tailored to Article 21, Article 19, and Article 14, including landmark cases like *Puttaswamy* and *Kesavananda Bharati*.

---
<img width="1896" height="954" alt="image" src="https://github.com/user-attachments/assets/5fd556d4-52bb-4f4f-9f0b-9f517751134c" />
<img width="1890" height="966" alt="image" src="https://github.com/user-attachments/assets/9b6de65a-ab78-49b1-a60f-d83da2be3b3c" />
<img width="1901" height="900" alt="image" src="https://github.com/user-attachments/assets/900d8180-8a22-4b8d-ad1e-76d0fb77b1ec" />




## Folder Structure

```text
LexArena-Moot-Court-Room/
├── Backend/                 # Node.js/Express Server
│   ├── src/
│   │   ├── config/          # Passport and Database configurations
│   │   ├── controllers/     # API request handlers
│   │   ├── data/            # Local datasets (Indian Legal Cases)
│   │   ├── middleware/      # Auth and session middleware
│   │   ├── models/          # Mongoose schemas (User/Case)
│   │   ├── routes/          # API endpoints (/courtroom, /auth)
│   │   └── services/        # AI orchestration and RAG logic
│   ├── server.js            # Entry point
│   └── .env                 # Environment variables
├── Frontend/                # React (Vite) Application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── assets/          # Icons and images
│   │ 
│   │   ├── views/           # Core pages (MootCourt, Dashboard)
│   │   ├── App.jsx          # Main routing logic
│   │   └── index.css        # Global design system
│   └── vite.config.js       # Vite configuration
└── README.md                # Project documentation
```

---

## Tech Stack

### Frontend
- **Framework**: React.js (via Vite)
- **Styling**: Vanilla CSS (Custom Design System with Inter & Playfair Display fonts)
- **State Management**: React Hooks & Context
- **API Client**: Axios

### Backend
- **Platform**: Node.js + Express
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: Passport.js (Google OAuth 2.0) + JWT (JSON Web Tokens)
- **Environment**: Dotenv for secure configuration

---

## AI Integration & Datasets

Lex Arena leverages state-of-the-art Generative AI models to power the courtroom experience:

1. **Gemini Models**: 
   - Uses `gemini-2.5-flash` for high-speed, low-latency judicial deliberation.
   - Separate prompt instructions are used to instantiate the **Judge** (neutral, Socratic) and the **Prosecutor** (aggressive, adversarial).
   - **AI Scoring**: Every user rebuttal is scored (0-100) based on legal accuracy and precedent application.

2. **Retrieval-Augmented Generation (RAG)**:
   - A custom service indexes and retrieves data from our proprietary legal dataset.
   - **Indian Legal Cases**: `indian-legal-cases.json` — A curated collection of landmark Indian Supreme Court judgments, holdings, and judicial principles.
   - When a user makes an argument, the RAG engine retrieves legally conflicting cases to empower the AI Prosecutor's rebuttal.

---

## Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- [Google Cloud Console](https://console.cloud.google.com/) (for Google OAuth)
- [Google AI Studio](https://aistudio.google.com/) (for Gemini API Key)

### Step 1: Clone the Repository
```bash
git clone https://github.com/creativeprem789/LexArena-Moot-Court-Room.git
cd LexArena-Moot-Court-Room
```

### Step 2: Configure the Backend
1. Navigate to the Backend folder:
   ```bash
   cd Backend
   npm install
   ```
2. Create a `.env` file in the `Backend/` directory and add your credentials:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_google_gemini_api_key
   JWT_SECRET=your_jwt_signing_secret
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```
3. Start the backend:
   ```bash
   npm start
   ```

### Step 3: Configure the Frontend
1. Open a new terminal and navigate to the Frontend folder:
   ```bash
   cd Frontend
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. The app will now be available at `http://localhost:5173/`.

---

## Live Demo
Visit the live deployment here: [Lex Arena Moot Court](https://lex-arena-moot-court-room.vercel.app/) *(Placeholder)*

---

## Future Improvements
- **Interactive Bench Reactions**: Dynamic visual feedback from the Judge's avatar (nodding, skepticism) based on AI scoring.
- **Live 1v1 Interaction**:Two lawyers can practise at same time as live proceeding as their opponent.
- **Voice-to-Argument**: Integration with Web Speech API for oral advocacy training.
- **Multi-Jurisdiction Library**: Expansion beyond Indian Constitutional Law into Criminal, Corporate, and International law modules.
- **Advanced Legal Analytics**: Detailed session reports including sentiment analysis and historical win/loss ratios and blunders done by the student &               practioner.
- We will make a system which ahs live leaderboard accessable globally so that it feels as competetive Learning Platform and will help them in netwroking with      experienced indivuduals

---

**Built By Team Integers
- Khushi Kumari
- Ayushman Mohanty
- Prem Kumar Rai
- Diksha Wagisha
