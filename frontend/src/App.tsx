import { useState, useCallback } from "react";
import { Header } from "./components/Header";
import { LeftProblemPanel } from "./components/LeftProblemPanel";
import { RightAgentWindow } from "./components/RightAgentWindow";
import { FullCardModal } from "./components/FullCardModal";
import { api } from "./services/api";
import type { ChatMessage, ActionType, UIPlan, UIComponentIntent, TestCase } from "./types/ui";

const DEFAULT_CODE = `// Write your Algorithmic solution here in C++ or any other supported language.
`;

export default function App() {
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [problemStatement, setProblemStatement] = useState<string>("");
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: "1",
      name: "Test Case 1",
      input: "",
      expectedOutput: ""
    }
  ]);
  const [activeTestCaseId, setActiveTestCaseId] = useState<string>("1");

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeLine] = useState<number>(1);
  const [status] = useState<string>("idle");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSynced, setIsSynced] = useState<boolean>(false);
  const [currentUIPlan, setCurrentUIPlan] = useState<UIPlan | null>(null);
  const [selectedFullCard, setSelectedFullCard] = useState<UIComponentIntent | null>(null);

  const activeTestCase = testCases.find((tc) => tc.id === activeTestCaseId) || testCases[0];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "agent",
      content: "Hello! I am CodeMentor AI, your interactive DSA coding assistant. Paste your solution and problem description on the left, then ask me to explain, debug, optimize, or generate a visual dry run.",
      timestamp: "Just now",
      actions: []
    }
  ]);

  const handleClearCode = useCallback(() => {
    setCode("");
    setIsSynced(false);
  }, []);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setIsSynced(false);
  };

  const handleProblemChange = (newProblem: string) => {
    setProblemStatement(newProblem);
    setIsSynced(false);
  };

  const handleUpdateTestCases = (updater: React.SetStateAction<TestCase[]>) => {
    setTestCases(updater);
    setIsSynced(false);
  };

  const handleSubmitToAgent = async () => {
    setIsSyncing(true);
    try {
      const activeInputText = activeTestCase ? activeTestCase.input : "";
      const res = await api.syncContext(sessionId, code, problemStatement, activeInputText);
      setSessionId(res.session_id);
      setIsSynced(true);

      const systemNotice: ChatMessage = {
        id: Date.now().toString() + "_sys",
        sender: "agent",
        content: "🚀 **Workspace Synchronized:** Your solution, problem statement, and active test cases are synced. Ask me anything or select an option below!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { id: "a1", label: "🔍 Show Dry Run", actionType: "DRY_RUN" },
          { id: "a3", label: "⚡ Show Fix", actionType: "SHOW_FIX" },
          { id: "a4", label: "🚀 Optimal Solution", actionType: "SHOW_OPTIMAL" },
          { id: "a5", label: "📊 Compare Complexity", actionType: "COMPARE" }
        ]
      };
      setMessages((prev) => [...prev, systemNotice]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: Date.now().toString() + "_err",
        sender: "agent",
        content: `Sync Error: ${err.message || "Failed to sync workspace details."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: []
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSendMessage = async (queryText: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: queryText || "Analyze my solution against the problem statement.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAnalyzing(true);

    try {
      let activeSessionId = sessionId;

      if (!activeSessionId || !isSynced) {
        const activeInputText = activeTestCase ? activeTestCase.input : "";
        const syncRes = await api.syncContext(activeSessionId, code, problemStatement, activeInputText);
        activeSessionId = syncRes.session_id;
        setSessionId(activeSessionId);
        setIsSynced(true);
      }

      const analysisData = await api.analyzeConversational(
        activeSessionId,
        queryText
      );

      const plan = analysisData.ui_plan;
      
      const agentMsg: ChatMessage = {
        id: Date.now().toString() + "_agent",
        sender: "agent",
        content: analysisData.chat_response || "No response generated.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: analysisData.intent === "General Chat" ? [] : [
          { id: "a1", label: "🔍 Show Dry Run", actionType: "DRY_RUN" },
          { id: "a3", label: "⚡ Show Fix", actionType: "SHOW_FIX" },
          { id: "a4", label: "🚀 Optimal Solution", actionType: "SHOW_OPTIMAL" },
          { id: "a5", label: "📊 Compare Complexity", actionType: "COMPARE" }
        ],
        uiPlan: plan || undefined
      };

      setCurrentUIPlan(plan || null);
      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: Date.now().toString() + "_err",
        sender: "agent",
        content: `Agent Error: ${err.message || "Something went wrong during code snippet analysis."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: []
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectAction = (actionType: ActionType, actionLabel: string) => {
    handleSendMessage(`[Action Selected: ${actionLabel}] Requesting ${actionType} analysis.`);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f0f11] text-gray-200 overflow-hidden font-sans select-none">
      <Header
        status={status}
        onAnalyze={() => handleSendMessage("Analyze my solution and suggest optimizations.")}
        isAnalyzing={isAnalyzing}
      />
      
      <main className="flex-1 flex overflow-hidden">
        <LeftProblemPanel
          code={code}
          setCode={handleCodeChange}
          problemStatement={problemStatement}
          setProblemStatement={handleProblemChange}
          testCases={testCases}
          setTestCases={handleUpdateTestCases}
          activeTestCaseId={activeTestCaseId}
          setActiveTestCaseId={setActiveTestCaseId}
          isAnalyzing={isAnalyzing}
          activeLine={activeLine}
          sessionId={sessionId}
          onClearCode={handleClearCode}
          onSubmitToAgent={handleSubmitToAgent}
          isSyncing={isSyncing}
          isSynced={isSynced}
        />

        <RightAgentWindow
          messages={messages}
          currentUIPlan={currentUIPlan}
          onSendMessage={handleSendMessage}
          onSelectAction={handleSelectAction}
          onViewFullCard={(intent) => setSelectedFullCard(intent)}
          isAnalyzing={isAnalyzing}
        />
      </main>

      <FullCardModal
        intent={selectedFullCard}
        onClose={() => setSelectedFullCard(null)}
      />
    </div>
  );
}
