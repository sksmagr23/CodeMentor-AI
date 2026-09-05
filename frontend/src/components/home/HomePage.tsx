import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSessionsList } from '../../services/api';
import type { SessionSummary } from '../../types/dsa';
import {
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
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

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
        .then((sessions) => setRecentSessions(sessions.slice(0, 3)))
        .catch(() => setRecentSessions([]));
    }
  }, [isAuthenticated]);

  return (
    <div className="flex-1 overflow-y-auto bg-graph text-ink selection:bg-accent selection:text-white h-full">
      {/* Hero — compact first viewport */}
      <section className="relative pt-6 sm:pt-8 pb-6 sm:pb-8 px-3 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink mb-3 leading-[1.05] tracking-tight">
            CodeMentor
            <span className="text-accent-bright italic"> AI</span>
          </h1>

          <p className="text-sm sm:text-base text-muted max-w-lg mx-auto mb-5 leading-relaxed">
            Conversational dry runs, counterexamples, and asymptotic clarity —
            without a rigid compiler sandbox.
          </p>

          <div className="flex flex-col xs:flex-row sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-2 sm:gap-2.5 mb-6">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={openAuthModal}
                  className="btn-brutal btn-brutal-yellow w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-display text-base"
                >
                  <span>Start Talking</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </button>
                <a
                  href="#capabilities"
                  className="btn-brutal btn-brutal-white w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm"
                >
                  <Compass className="w-4 h-4" strokeWidth={2.25} />
                  <span>Explore Features</span>
                </a>
              </>
            ) : (
              <>
                <button
                  onClick={onLaunchWorkspace}
                  className="btn-brutal btn-brutal-blue w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm"
                >
                  <Play className="w-4 h-4 fill-current" strokeWidth={2.25} />
                  <span>Launch Workspace</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </button>
                <button
                  onClick={onStartNewSession}
                  className="btn-brutal btn-brutal-white w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-sm"
                >
                  <Plus className="w-4 h-4 text-accent-bright" strokeWidth={2.5} />
                  <span>New Session</span>
                </button>
                <button
                  onClick={onOpenHistory}
                  className="btn-brutal btn-brutal-white w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-sm"
                >
                  <History className="w-4 h-4" strokeWidth={2.25} />
                  <span>History</span>
                </button>
              </>
            )}
          </div>

          {/* Product preview */}
          <div className="panel-brutal text-left overflow-hidden animate-pop-in">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b-2 border-accent bg-accent-soft">
              <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[10px] sm:text-[11px] text-ink truncate">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 border-accent bg-danger shrink-0" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 border-accent bg-warn shrink-0" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 border-accent bg-success shrink-0" />
                <span className="ml-1 sm:ml-2 truncate">codementor · dual-pane</span>
              </div>
              <span className="font-mono text-[10px] text-accent-bright uppercase font-semibold shrink-0">C++</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
              <div className="md:col-span-7 p-3 sm:p-4 space-y-2.5 border-b-2 md:border-b-0 md:border-r-2 border-accent bg-paper-elevated">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-accent bg-accent text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0">
                    U
                  </div>
                  <div className="border-2 border-accent bg-accent text-white px-2.5 py-1.5 text-[11px] sm:text-xs shadow-hard-sm text-left">
                    Solve 3Sum and explain the optimal invariant.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-accent overflow-hidden shrink-0">
                    <BrandLogo size={28} className="w-full h-full" />
                  </div>
                  <div className="border-2 border-accent bg-paper p-2.5 text-[11px] sm:text-xs text-ink w-full space-y-1.5 shadow-hard-sm text-left">
                    <p className="leading-relaxed">
                      Sort, then <strong className="text-accent-bright">two pointers</strong> on the
                      remaining subarray — eliminate duplicates in{' '}
                      <code className="font-mono bg-accent-soft border border-accent px-1 text-accent-bright">O(N²)</code>.
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="px-1.5 py-0.5 border-2 border-accent bg-paper-elevated font-mono text-[10px]">
                        Time · O(N²)
                      </span>
                      <span className="px-1.5 py-0.5 border-2 border-accent bg-accent-soft font-mono text-[10px] text-accent-bright">
                        Space · O(1)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 p-3 sm:p-4 bg-paper font-mono text-xs text-ink space-y-2 text-left">
                <div className="flex items-center justify-between border-b-2 border-accent pb-1.5">
                  <span className="text-accent-bright font-semibold uppercase text-[10px] tracking-wider">
                    Active Problem
                  </span>
                  <span className="text-[10px] border-2 border-accent px-1.5 bg-paper-elevated">cpp</span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed line-clamp-2 font-sans">
                  Given nums, return all triplets [i,j,k] such that sum is 0.
                </p>
                <div className="p-2 border-2 border-accent bg-paper-elevated text-[10px] sm:text-[11px] space-y-0.5 shadow-hard-sm overflow-x-auto">
                  <div><span className="text-accent-bright">class</span> <span className="font-semibold">Solution</span> {'{'}</div>
                  <div className="pl-3 whitespace-nowrap">vector&lt;vector&lt;int&gt;&gt; threeSum(...) {'{'}</div>
                  <div className="pl-6 text-muted">// Monaco · live context</div>
                  <div className="pl-3">{'}'}</div>
                  <div>{'};'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isAuthenticated && recentSessions.length > 0 && (
        <section className="px-3 sm:px-6 max-w-5xl mx-auto py-5 sm:py-6 border-t-2 border-accent">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-accent-bright" strokeWidth={2.25} />
              <h2 className="font-display text-xl sm:text-2xl text-ink">Continue</h2>
            </div>
            <button
              onClick={onOpenHistory}
              className="text-xs font-medium text-accent-bright hover:underline underline-offset-2"
            >
              View all →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {recentSessions.map((session) => (
              <button
                key={session.session_id}
                onClick={() => onSelectSession(session.session_id)}
                className="panel-brutal p-3 sm:p-3.5 text-left group hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="px-1.5 py-0.5 border-2 border-accent bg-accent-soft font-mono text-[10px] text-accent-bright uppercase">
                    {session.language || 'cpp'}
                  </span>
                  <span className="text-[10px] text-muted font-mono">
                    {session.message_count} msg
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-ink group-hover:text-accent-bright transition-colors line-clamp-1 mb-2">
                  {session.problem_title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-muted border-t-2 border-accent pt-1.5">
                  <span>Resume</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-accent-bright" strokeWidth={2.5} />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section id="capabilities" className="px-3 sm:px-6 max-w-5xl mx-auto py-6 sm:py-8 border-t-2 border-accent">
        <div className="text-center max-w-xl mx-auto mb-5 sm:mb-6">
          <h2 className="font-display text-2xl sm:text-3xl text-ink mb-1.5">
            Built for algorithmic mastery
          </h2>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            Analyze logic, build counterexamples, and illustrate traces in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {[
            { icon: Code2, title: 'Logic Breakdown', body: 'Analyze code against the problem across languages — no strict compiler required.' },
            { icon: Bug, title: 'Failing Counterexamples', body: 'Pinpoint edge cases and off-by-ones with concrete expected vs actual output.' },
            { icon: Cpu, title: 'Illustrated Dry Runs', body: 'Step-through traces for pointers, arrays, and recursion — on demand.' },
            { icon: Sparkles, title: 'Optimal Transformation', body: 'Turn brute-force O(N²) into clean O(N) / O(N log N) with minimal diffs.' },
            { icon: Layers, title: 'Dual-Pane Layout', body: 'Chat left, Monaco + test cases right — resize with a hard divider.' },
            { icon: CheckCircle2, title: 'Session Memory', body: 'Every turn saved. Switch problems or follow up without losing context.' },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="panel-brutal p-3.5 sm:p-4 hover:-translate-y-0.5 hover:shadow-hard-lg transition-all">
              <div className="w-8 h-8 border-2 border-accent bg-accent-soft text-accent-bright flex items-center justify-center mb-2.5 shadow-hard-sm">
                <Icon className="w-4 h-4" strokeWidth={2.25} />
              </div>
              <h3 className="font-display text-lg text-ink mb-1">{title}</h3>
              <p className="text-xs text-muted leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-3 sm:px-6 max-w-5xl mx-auto py-5 sm:py-6 text-center border-t-2 border-accent">
        <h3 className="font-mono text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">
          Supported languages
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-2xl mx-auto">
          {['C++', 'Python', 'Java', 'JavaScript', 'Go', 'Rust'].map((lang) => (
            <span
              key={lang}
              className="px-2.5 py-1 border-2 border-accent bg-paper-elevated shadow-hard-sm font-mono text-[11px] sm:text-xs"
            >
              {lang}
            </span>
          ))}
        </div>
      </section>

      <footer className="px-3 sm:px-6 py-4 sm:py-5 border-t-2 border-accent bg-paper-elevated text-xs text-muted flex flex-col sm:flex-row items-center justify-between gap-3 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-ink">
          <div className="w-6 h-6 border-accent overflow-hidden shrink-0">
            <BrandLogo size={24} className="w-full h-full" />
          </div>
          <span className="font-display text-base text-ink">CodeMentor AI</span>
          <span className="text-muted hidden sm:inline">· DSA Mentorship</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 font-mono text-[10px] sm:text-[11px]">
          <span>React</span>
          <span>FastAPI</span>
          <span>ADK</span>
          <span>Gemini</span>
        </div>
      </footer>
    </div>
  );
};
