# Aura-Flow | Multi-Agent Orchestrator (Version 2026/1.0)

![Aura-Flow](https://img.shields.io/badge/Status-Beta-purple.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

**Aura-Flow** is a fully autonomous, LLM-powered cognitive engine. It coordinates a team of specialized AI agents to dynamically analyze requirements, architect solutions, write structured code, and self-execute test suites within a secure sandboxed environment.

Built originally with LangChain & LangGraph in Python for the backend, and an ultra-premium React/Next.js "glassmorphism" dashboard for the frontend.

## 🌟 Key Features

- **Multi-Agent Architecture**: Uses specialized AI workers:
  - **Supervisor**: Analyzes the initial task vector and delegates work.
  - **Researcher**: Formulates an architectural blueprint and outlines logic.
  - **Coder**: Implements the actual code inside a deterministic sandbox environment.
  - **Verifier**: Runs test commands against the code and iterates back to the Coder on failure until perfection.
- **Dynamic Language Support**: The dashboard intelligently parses generated scripts and renders official language logos securely within the sandbox UI for instant context.
- **Self-Healing Execution Loop**: If the **Verifier** encounters an error (e.g. failing tests, syntax issues), the error logs are fed directly back into the **Coder**, repeating the cycle autonomously until tests pass.
- **Premium Glassmorphic Interface**: Frontend constructed with an Apple-like frosted glass aesthetic, tailored light & dark themes, real-time thought-stream updates (Server-Sent Events), and micro-animations.
- **100% Free Gemini Engine Integration**: Replaced expensive OpenAI calls, engineered specifically to map complex payload structures back down to raw JSON mapping using Google's free Gemini 2.5 Flash API.

## 🛠️ Technology Stack

**Frontend Design:**
- Framework: **Next.js 15+ (React 19)** via TypeScript
- Styling: **Tailwind CSS V4**, Custom Glassmorphism CSS variables
- Icons & Animation: **Lucide React**, **Framer Motion**

**Orchestration Backend:**
- Framework: **FastAPI** leveraging streaming endpoints
- Agent Logic: **LangGraph**, **LangChain Core**
- LLM Inference: **Google Generative AI (Gemini 2.5 Flash)**
- Environment: **Python 3.12**, Virtual Environments (`venv`)

## 🚀 Getting Started

### Prerequisites

You will need a free Google Gemini API Key. Go to [Google AI Studio](https://aistudio.google.com/) to snag one.

### 1. Setup Backend (Agent System)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
Set up the environment variables:
Create a `.env` in the `/backend` folder.
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```
Run the FastApi Server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
*(The backend handles LangGraph processing and streams via SSE.)*

### 2. Setup Frontend (Orchestrator UI)
```bash
cd frontend
npm install
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) and issue a task like *"Write a Node.js script that calculates the Fibonacci sequence up to N."*

## 🤝 Let's Collaborate

- Portfolio: [adityapatil8.vercel.app](https://adityapatil8.vercel.app/)
- LinkedIn: [adityap817](https://www.linkedin.com/in/adityap817/)
- GitHub: [adityap817](https://github.com/adityap817)

Made with ❤️ by **Aditya Patil** aka **adiicodes** © 2026.
