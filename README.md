# CodeMentor AI

> **An interactive, conversational Data Structures & Algorithms (DSA) mentor with dynamic Generative UI, visual dry-run illustrations, Monaco code editor, and persistent session memory.**

- **Conversational & Non-Intrusive**: Chat naturally in real time. The chat workspace is persistent, responsive, and renders rich GitHub-flavored markdown, HTML formatting, and syntax-highlighted code blocks.
- **Dual-Pane Interactive Workspace**: 
  - **Left Pane**: Main conversational chat stream with interactive Generative UI cards, dynamic next action chips, and rich markdown.
  - **Right Pane**: Active DSA Context Preview Panel featuring an in-place Monaco editor, live language switcher, and multiple test cases manager.
- **Generative Visual UI**: Instead of raw text or messy JSON dumps, CodeMentor dynamically plans and renders rich visual cards directly in the chat stream: interactive bug breakdowns, side-by-side complexity matrices, failing counterexamples, and illustrated dry-run diagrams.
- **Monaco Code Editor Integration**: Full-featured Monaco code editor for viewing snippets, debugging fixes, optimal implementations, and editing solution code directly in-place.
- **Conceptual & Language-Agnostic**: Does not rely on rigid compilers. It evaluates the pure algorithmic logic of your code across C++, Python, Java, JavaScript/TypeScript, Go, or Rust.
- **Multi-Problem Support in One Session**: Discuss multiple problems back-to-back in the same conversation thread without losing history.

---

## Key Features

### 1. Immediate Solution Generation
- Give any problem statement or ask *"How to solve 3Sum"* without being forced to provide code first.
- CodeMentor AI immediately generates:
  - The **optimal algorithmic pattern** (e.g. Two Pointers, Monotonic Stack, Dynamic Programming).
  - The **optimal implementation** in your chosen programming language with clean, production-grade code.
  - Asymptotic time and auxiliary space complexity derivations.

### 2. Comprehensive Solution Analysis & Logic Breakdown
- Submit your code in C++, Python, Java, JS/TS, Go, or Rust:
  - **Pattern Classification**: Identifies underlying algorithms and data structures.
  - **Correctness Classification**: Evaluates if the solution is `Correct & Optimal`, `Correct but Suboptimal`, `Right Idea, Buggy Implementation`, or `Incorrect Approach`.
  - **Strengths & Weaknesses**: Highlights clean logic and uncovers hidden pitfalls or memory inefficiencies.

### 3. Pinpoint Bug Diagnosis & Failing Counterexamples
- **Root Cause Explanation**: Pinpoints exactly *why* your solution fails (e.g., boundary condition, off-by-one pointer error, integer overflow).
- **Failing Counterexample**: Generates a concrete failing test case contrasting **Your Code's Output** vs. **Expected Output**.
- **Corrected Code Viewer**: Displays the cleanly corrected code in a Monaco editor with minimal comments and clear guidance.

### 4. On-Demand Visual Dry Runs (AI-Illustrated Traces)
- Request a dry run anytime (`"Show dry run"`, `"Trace execution"`).
- CodeMentor AI generates an educational diagram using **Gemini Multimodal Image Generation** paired with an SVG vector fallback engine.
- Step-by-step trace showing array indices, pointer updates, hash map states, and recursion tree progress.
- Includes a full-screen **Lightbox Modal** with download capabilities for offline study.

### 5. Monaco Code Editor Integration
- Embedded **Monaco Code Editor** with dark mode theme (`vs-dark`):
  - Syntax highlighting for C++, Python, Java, JavaScript, TypeScript, Go, and Rust.
  - Dual modes: read-only formatted viewing with line numbers + interactive in-place editing.
  - One-click **Copy Code** button.

### 6. In-Place Context Editor & Multiple Test Cases
- Click **"Edit"** in the right preview panel to edit problem statements, solution code, or test cases **directly inside the panel without sending chat messages**.
- Add, update, and manage multiple test cases per problem (`+ Add Test Case`, delete, copy).
- Flexible input rules: provide only a problem statement, only code, or both.

### 7. Multi-Problem Discussion in One Session
- Discuss multiple problems back-to-back in the same conversation thread.
- When you introduce a new problem (e.g. *"Now let's solve Longest Substring Without Repeating Characters"*), CodeMentor automatically detects the new problem, updates the MongoDB context in-place, and refreshes the preview panel seamlessly.

### 9. 🗄️ Multi-Session History Management
- All sessions are automatically persisted in MongoDB (`dsa_sessions` and `conversation_history`).
- Open the **Session History Drawer** to switch between past problems, review prior chats, or delete older sessions.
- Browser `localStorage` recovery ensures active session persistence on page refreshes.

---

### BenchMarks

1. **Non-Compiler Conceptual Evaluation**:
   No heavy compiler sandboxes or execution containers. CodeMentor evaluates conceptual algorithm semantics, avoiding platform discrepancies and supporting instant reasoning across any language.

2. **Controlled Generative UI**:
   The LLM never emits raw executable JSX. Instead, the backend enforces validated Pydantic schemas, and the frontend safely maps each structured payload to a registered React component:
   - `problem_setup_form` $\rightarrow$ Interactive setup form (optional fields & multi-test cases)
   - `problem_summary` $\rightarrow$ Problem statement, pattern, constraints breakdown
   - `approach_card` $\rightarrow$ Algorithmic logic, data structures, complexity badges
   - `bug_analysis_card` $\rightarrow$ Failure cause, failing condition, Monaco fix snippet
   - `counterexample_card` $\rightarrow$ Failing input, actual vs. expected output
   - `dry_run_image` $\rightarrow$ Step trace + visual diagram with lightbox modal
   - `optimization_card` $\rightarrow$ Optimal approach & Monaco code viewer
   - `solution_comparison_card` $\rightarrow$ Side-by-side trade-off matrix
   - `code_viewer` $\rightarrow$ Formatted snippet with Monaco editor & copy
   - `complexity_card` $\rightarrow$ Code complexity derivation & bottleneck breakdown

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

## Setup Guide

### Prerequisites

- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** & **npm**
- **MongoDB** running locally (`mongodb://localhost:27017`) or a free MongoDB Atlas connection string
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

---

### 1. Configure Backend

```bash
cd CodeMentor-AI

# Create and activate Python virtual environment
# Windows:
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS:
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r backend/requirements.txt
```

Create or verify `backend/.env`:
```env
GEMINI_API_KEY=
MONGODB_URL=
DATABASE_NAME=
```

Start the FastAPI backend server:
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
- **API Base URL**: `http://localhost:8000/api`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

---

### 2. Configure Frontend

```bash
cd CodeMentor-AI/frontend
npm install
```

Create or verify `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000/api
```

Start the Vite development server:
```bash
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---
