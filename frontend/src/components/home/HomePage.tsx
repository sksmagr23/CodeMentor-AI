import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSessionsList } from '../../services/api';
import type { SessionSummary } from '../../types/dsa';
import {
  Terminal,
  Sparkles,
  Code2,
  Bug,
  Cpu,
  Layers,
  ArrowRight,
  Play,
  CheckCircle2,
  History,
  Plus,
  Compass,
} from 'lucide-react';

interface HomePageProps {
  onLaunchWorkspace: () => void;
  onStartNewSession: () => void;
  onOpenHistory: () => void;
  onSelectSession: (sessionId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onLaunchWorkspace,
  onStartNewSession,
  onOpenHistory,
  onSelectSession,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [recentSessions, setRecentSessions] = useState<SessionSummary[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      getSessionsList()
        .then((sessions) => {
          setRecentSessions(sessions.slice(0, 3));
        })
        .catch(() => {
          setRecentSessions([]);
        });
    }
  }, [isAuthenticated]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B0F17] text-slate-100 selection:bg-cyan-500/30">
      <section className="relative pt-12 pb-20 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 md:w-150 h-96 bg-linear-to-tr from-cyan-600/20 via-blue-600/15 to-purple-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="text-center max-w-4xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-medium mb-6 shadow-lg shadow-cyan-500/10 animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Powered by Gemini 2.5 Flash & Google ADK • Next-Gen DSA Pair Programming</span>
          </div>

         
          <h1 className="font-['Space_Grotesk'] text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-100 mb-6 leading-tight">
            Master Data Structures & Algorithms with an{' '}
            <span className="bg-linear-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Intelligent AI Pair-Programmer
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            Conversational logic breakdown, pinpoint bug diagnosis, on-demand visual dry-run illustrations,
            and optimal asymptotic derivations—without rigid compiler sandboxes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={openAuthModal}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm border-2 border-slate-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#capabilities"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-sm transition-all"
                >
                  <Compass className="w-4 h-4 text-slate-400" />
                  <span>Explore Features</span>
                </a>
              </>
            ) : (
              <>
                <button
                  onClick={onLaunchWorkspace}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-cyan-600/25 transition-all transform hover:-translate-y-0.5"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Launch Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onStartNewSession}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-200 font-medium text-sm transition-all"
                >
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <span>New Problem Session</span>
                </button>

                <button
                  onClick={onOpenHistory}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-medium text-sm transition-all"
                >
                  <History className="w-4 h-4 text-purple-400" />
                  <span>History Drawer</span>
                </button>
              </>
            )}
          </div>

          <div className="relative mx-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-2 sm:p-4 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-900/90 rounded-t-xl mb-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="font-['JetBrains_Mono'] text-[11px] text-slate-400 ml-2">
                  CodeMentor AI • Dual-Pane Live Session
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-mono">
                <span>Active Context (C++)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-left">
              <div className="md:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 space-y-3 font-sans">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 text-xs font-bold">
                    U
                  </div>
                  <div className="bg-blue-600 text-white rounded-2xl px-3 py-2 text-xs">
                    Solve 3Sum and explain the optimal invariant.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-linear-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shrink-0 text-xs">
                    <Terminal className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-300 w-full space-y-2">
                    <p className="leading-relaxed">
                      We can sort the array and apply a <strong>Two Pointer</strong> approach on the remaining subarray to eliminate duplicate triplets in <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">O(N²)</code> time.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 text-[10px] font-mono">
                        Time: O(N²)
                      </span>
                      <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 text-[10px] font-mono">
                        Space: O(1)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 font-['JetBrains_Mono'] text-xs text-slate-300 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
                  <span className="text-cyan-400 font-semibold">Active Problem</span>
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">C++</span>
                </div>
                <div className="text-[11px] text-slate-300 line-clamp-2">
                  Given integer array nums, return all triplets [nums[i], nums[j], nums[k]] such that i!=j!=k and sum is 0.
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-cyan-300 font-mono space-y-1">
                  <div><span className="text-purple-400">class</span> <span className="text-yellow-300">Solution</span> &#123;</div>
                  <div className="pl-3"><span className="text-blue-400">vector</span>&lt;<span className="text-blue-400">vector</span>&lt;<span className="text-emerald-400">int</span>&gt;&gt; threeSum(...) &#123;</div>
                  <div className="pl-6 text-slate-500">// Monaco Editor</div>
                  <div className="pl-3">&#125;</div>
                  <div>&#125;;</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isAuthenticated && recentSessions.length > 0 && (
        <section className="px-4 md:px-8 max-w-7xl mx-auto py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-purple-400" />
              <h2 className="font-['Space_Grotesk'] text-lg font-bold text-slate-100">
                Continue Where You Left Off
              </h2>
            </div>
            <button
              onClick={onOpenHistory}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View All History →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentSessions.map((session) => (
              <button
                key={session.session_id}
                onClick={() => onSelectSession(session.session_id)}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 transition-all text-left group shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-400 uppercase">
                      {session.language || 'cpp'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {session.message_count} messages
                    </span>
                  </div>
                  <h3 className="font-semibold text-xs text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1">
                    {session.problem_title}
                  </h3>
                </div>
                <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
                  <span>Resume Session</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-cyan-400" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section id="capabilities" className="px-4 md:px-8 max-w-7xl mx-auto py-16 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-extrabold text-slate-100 mb-3">
            Engineered for Deep Algorithmic Mastery
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed font-sans">
            Move beyond memorizing solutions. CodeMentor AI analyzes logic, builds counterexamples, and illustrates traces in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-4">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-100 mb-2">
              Conceptual Logic Breakdown
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyzes your code against the problem statement across any language without requiring strict compilers.
            </p>
          </div>

          
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-4">
              <Bug className="w-5 h-5" />
            </div>
            <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-100 mb-2">
              Failing Counterexamples
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pinpoints edge-case failures, off-by-one errors, and generates concrete failing inputs contrasting expected vs. actual output.
            </p>
          </div>

          
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-100 mb-2">
              AI-Illustrated Dry Runs
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Step-by-step visual execution traces illustrating pointer movement, array states, and recursion trees on demand with a lightbox modal.
            </p>
          </div>

          
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-100 mb-2">
              Optimal Transformation
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Learn how to optimize brute-force O(N²) solutions into optimal O(N) or O(N log N) implementations with clean, minimal code.
            </p>
          </div>

          
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-100 mb-2">
              Dual-Pane Resizable Layout
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Chat on the left, active Monaco code editor & multiple test cases on the right with a smooth draggable slider and fullscreen dark modals.
            </p>
          </div>

          
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-100 mb-2">
              Persistent Multi-Session Memory
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every turn and session is automatically saved. Switch problems or ask follow-ups anytime without losing context.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-8 max-w-7xl mx-auto py-12 text-center border-t border-slate-900">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
          Supported Programming Languages & Dialects
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto">
          {['C++', 'Python', 'Java', 'JavaScript', 'Go', 'Rust'].map((lang, i) => (
            <span
              key={i}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-['JetBrains_Mono'] text-xs"
            >
              {lang}
            </span>
          ))}
        </div>
      </section>


      <footer className="px-4 md:px-8 py-8 border-t border-slate-900 bg-slate-950/80 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-['Space_Grotesk'] font-bold text-slate-200">CodeMentor AI</span>
          <span>• Interactive DSA Mentorship</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <span>React</span>
          <span>FastAPI</span>
          <span>Google ADK</span>
          <span>Gemini</span>
        </div>
      </footer>
    </div>
  );
};
