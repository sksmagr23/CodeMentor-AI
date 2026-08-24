import React, { useState } from "react";
import { Code2, Copy, Check, Maximize2 } from "lucide-react";

interface CodeViewerCardProps {
  code?: string;
  language?: string;
  title?: string;
  explanation?: string;
  onViewFull?: () => void;
}

export const CodeViewerCard: React.FC<CodeViewerCardProps> = ({
  code = "",
  language = "cpp",
  title = "Solution Code Snippet",
  explanation = "",
  onViewFull
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-none overflow-hidden flex flex-col mb-4 font-sans">
      <div className="h-9 bg-[#131316] border-b border-[#27272a] flex items-center justify-between px-3">
        <div className="flex items-center space-x-2">
          <Code2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
            {title}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
            {language}
          </span>
          {onViewFull && (
            <button
              onClick={onViewFull}
              className="flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 bg-[#27272a] hover:bg-[#3f3f46] text-emerald-300 border border-[#3f3f46] transition cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" />
              <span>View Full</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {explanation && (
          <p className="text-xs text-gray-400 leading-relaxed">
            {explanation}
          </p>
        )}

        <div className="relative group bg-[#0f0f11] border border-[#27272a] p-3 overflow-hidden">
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1 bg-[#27272a]/80 hover:bg-[#3f3f46] border border-[#3f3f46] text-gray-300 hover:text-white transition rounded opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <pre className="text-xs font-mono text-gray-200 overflow-x-auto whitespace-pre leading-relaxed pr-8">
            <code>{code.trim()}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
