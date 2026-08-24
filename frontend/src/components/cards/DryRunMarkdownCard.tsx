import React, { useState } from "react";
import { Sparkles, Maximize2, Minimize2, Terminal } from "lucide-react";
import { renderMarkdown } from "../../utils/markdown";

interface DryRunMarkdownCardProps {
  markdown?: string;
  title?: string;
  description?: string;
  onViewFull?: () => void;
}

export const DryRunMarkdownCard: React.FC<DryRunMarkdownCardProps> = ({
  markdown = "",
  title = "AI Educational Dry Run Trace",
  description = "A step-by-step execution dry run showing state transitions, variable tracing, and code logic shifts.",
  onViewFull
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const activeContent = renderMarkdown(markdown);

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-none overflow-hidden flex flex-col mb-6">
      <div className="h-10 bg-[#131316] border-b border-[#27272a] flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
            {title}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {onViewFull ? (
            <button
              onClick={onViewFull}
              className="flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 bg-[#27272a] hover:bg-[#3f3f46] text-emerald-300 border border-[#3f3f46] transition cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" />
              <span>View Full</span>
            </button>
          ) : (
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-1 text-gray-400 hover:text-white hover:bg-[#27272a] transition"
              title="Toggle Expand Modal"
            >
              {isZoomed ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4 font-sans">
        <p className="text-xs text-gray-400 leading-relaxed border-l-2 border-indigo-500 pl-3 italic bg-[#121214]/50 py-1.5 font-sans">
          {description}
        </p>

        <div className="bg-[#121214] border border-[#27272a] p-4 overflow-y-auto max-h-125 custom-scrollbar">
          {activeContent || (
            <span className="text-xs text-gray-600 font-mono italic">No dry run trace generated.</span>
          )}
        </div>
      </div>

      {isZoomed && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#27272a]">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase">{title}</h3>
            </div>
            <button
              onClick={() => setIsZoomed(false)}
              className="px-3 py-1.5 bg-[#27272a] text-gray-300 border border-[#3f3f46] text-xs font-mono hover:bg-[#3f3f46]"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-auto p-6 bg-[#0f0f11] mt-4 border border-[#27272a]">
            <p className="text-xs text-gray-400 leading-relaxed font-sans border-l-2 border-indigo-500 pl-3 italic mb-4">
              {description}
            </p>
            <div>{activeContent}</div>
          </div>
        </div>
      )}
    </div>
  );
};
