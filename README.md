# CodeMentor AI

> **Your Intelligent DSA Pair Programmer & Algorithm Visualizer**

CodeMentor AI is an interactive learning and debugging platform designed to help developers and students master Data Structures & Algorithms (DSA). Chat naturally, analyze your code conceptually, inspect failing counterexamples, and visualize step-by-step execution traces with AI-generated diagrams.

---

## What You Can Do with CodeMentor AI

### 1. Chat & Learn Naturally
- **Easy Problem Setup**: Simply mention a problem by name (e.g., *"How do I solve 3Sum?"*, *"Explain Trapping Rain Water"*) or paste your code. CodeMentor automatically extracts the problem description, sets up your code editor, and prepares test cases.
- **Conceptual Mentorship**: Get clear, encouraging explanations tailored to your skill level without dense compiler errors or robotic jargon.

### 2. Deep Code Analysis & Instant Feedback
- **Approach & Logic Breakdown**: Understand the algorithmic pattern behind your code (Two Pointers, Sliding Window, Dynamic Programming, etc.).
- **Complexity Derivations**: View clear asymptotic Time and Space Complexity explanations for your solution.
- **Compare Approaches**: Compare your current solution against brute-force and optimal approaches side-by-side.

### 3. Pinpoint Bug Diagnosis & Counterexamples
- **Why Does It Fail?**: Discover logic bugs, off-by-one errors, and boundary issues with plain-English explanations.
- **Concrete Failing Test Cases**: See exact counterexample inputs where your solution breaks, comparing what your code returns vs. the expected answer.
- **Clean Fixes**: View clean, corrected code with non-intrusive annotations explaining the fix.

### 4. Visual Dry-Run Traces
- **On-Demand Execution Diagrams**: Ask for a dry run anytime (*"Show dry run"*, *"Trace execution"*) to generate a visual diagram illustrating data structures, pointer movements, and variable updates.
- **Full-Screen Lightbox**: Zoom in on execution diagrams or download them for offline study.

### 5. In-Place Code Editor & Multi-Test Manager
- **Interactive Code Editor**: Syntax-highlighted code editor supporting C++, Python, Java, JavaScript, TypeScript, Go, and Rust.
- **Dual-Pane Workspace**: Chat comfortably on the left while keeping your active problem, code, and test cases accessible on the right.
- **Full-Screen Mode**: Expand the code editor or problem statement into a focused full-screen popup modal anytime.
- **Custom Test Cases**: Add, edit, or delete multiple test cases directly in the workspace panel.

### 6. Interactive Action Chips
- **One-Click Next Steps**: Dynamic action buttons appear after each explanation (e.g., *"Show Dry Run"*, *"Why is it wrong?"*, *"Show Optimal Solution"*) to guide your learning journey seamlessly.

### 7. Saved Sessions & History
- **Personalized Account**: Sign in securely with Google.
- **Multi-Session History**: Switch between past problem discussions or start fresh sessions anytime from the sidebar drawer.

---

## Project Structure

```text
├── backend/
│   ├── agents/               # AI Agent
│   │   ├── planner.py        # Orchestrates conversations, tool routing & context syncing
│   │   ├── prompts.py        # System instructions and Agent prompt
│   │   ├── tool.py           # Mark functions as agent tool
│   │   ├── tools.py          # 10 specialized DSA analysis and illustration tools
│   │   └── schemas.py        # Pydantic data schemas and intent definitions
│   ├── api/
│   │   └── routes/           # FastAPI API endpoints (auth, query, sessions)
│   ├── db/
│   │   └── mongodb.py        # MongoDB connection manager
│   ├── services/             # Session management, chat history, and dry-run image generation
│   ├── tests/                # Integration test suite
│   ├── main.py               # FastAPI Entry point
│   └── requirements.txt      # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/         # Google auth modal
│   │   │   ├── cards/        # Visual UI cards
│   │   │   ├── chat/         # Chat stream, input area, and dynamic action chips
│   │   │   ├── common/       # Monaco code editor and Markdown renderer
│   │   │   ├── home/         # landing page
│   │   │   └── workspace/    # Dual-pane layout and history drawer
│   │   ├── context/          # User state provider
│   │   ├── hooks/            # Custom React hooks
│   │   ├── registry/         # Component registry mapping AI structured outputs
│   │   ├── services/         # API communication
│   │   ├── types/            # TypeScript interfaces
│   │   └── App.tsx           # Main application router and split-view manager
│   ├── package.json          # Node dependencies and scripts
│   └── vite.config.ts        # Vite configuration
│
└── README.md                 # Project documentation
```

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | **FastAPI** |
| **Agent Engine** | **Google ADK**, **Google GenAI SDK** |
| **Database** | **MongoDB** |
| **Data Validation** | **Pydantic** |
| **Frontend** | **React (Vite)**, **TypeScript**, **Tailwind CSS** |

---

## How to Get Started

### Prerequisites
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** & **npm**
- **MongoDB** (local installation or MongoDB Atlas free tier)
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

---

### Step 1: Start the Backend

1. Navigate to the project root and create a virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. Create a `backend/.env` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   MONGODB_URL=mongodb://localhost:27017
   DB_NAME=codementor_db
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the backend server:
   ```bash
   python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```

---

### Step 2: Start the Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   npm install
   ```

2. Create a `frontend/.env` file:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

3. Start the application:
   ```bash
   npm run dev
   ```

4. Open **`http://localhost:5173`** in your browser and enjoy learning with CodeMentor AI!
