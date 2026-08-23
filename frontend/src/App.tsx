import { useState, useCallback } from "react";
import { Header } from "./components/Header";
import { LeftProblemPanel } from "./components/LeftProblemPanel";
import { RightAgentWindow } from "./components/RightAgentWindow";
import { FullCardModal } from "./components/FullCardModal";
import { api } from "./services/api";
import type { ChatMessage, ActionType, UIComponentIntent, TestCase } from "./types/ui";

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

  const [activeLine] = useState<number>(1);
  const [status] = useState<string>("idle");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
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
  }, []);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleProblemChange = (newProblem: string) => {
    setProblemStatement(newProblem);
  };

  const handleUpdateTestCases = (updater: React.SetStateAction<TestCase[]>) => {
    setTestCases(updater);
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
      const activeInputText = activeTestCase ? activeTestCase.input : "";

      const analysisData = await api.analyzeSnippet(
        code,
        problemStatement,
        activeInputText,
        queryText
      );

      const plan = analysisData.ui_plan;

      const dynamicActions = analysisData.suggested_actions
        ? analysisData.suggested_actions.map((act: any, idx: number) => ({
            id: `act_${idx}_${Date.now()}`,
            label: act.label,
            actionType: "DRY_RUN",
            query: act.query
          }))
        : [];
      
      const agentMsg: ChatMessage = {
        id: Date.now().toString() + "_agent",
        sender: "agent",
        content: analysisData.chat_response || "No response generated.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: dynamicActions,
        uiPlan: plan || undefined
      };

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

  const handleSelectAction = (_actionType: ActionType, queryOrLabel: string) => {
    handleSendMessage(queryOrLabel);
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
          sessionId={null}
          onClearCode={handleClearCode}
        />

        <RightAgentWindow
          messages={messages}
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
