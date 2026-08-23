import React, { useState } from "react";
import { Sparkles, Maximize2, Minimize2, Terminal } from "lucide-react";

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

  const renderMarkdown = (text: string) => {
    if (!text) return null;

    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    const flushTable = (key: string) => {
      if (tableHeaders.length > 0 || tableRows.length > 0) {
        elements.push(
          <div key={`table-${key}`} className="overflow-x-auto my-3 border border-[#27272a] rounded-none">
            <table className="min-w-full text-xs font-mono border-collapse bg-[#121214]">
              <thead>
                <tr className="border-b border-[#27272a] bg-[#18181b]">
                  {tableHeaders.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left text-[11px] font-bold text-gray-300 uppercase tracking-wider border-r border-[#27272a] last:border-r-0">
                      {h.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-[#27272a] last:border-b-0 hover:bg-[#18181b]/50">
                    {row.map((cell, i) => (
                      <td key={i} className="px-3 py-2 text-gray-300 border-r border-[#27272a] last:border-r-0 whitespace-nowrap">
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableHeaders = [];
        tableRows = [];
        inTable = false;
      }
    };

    let inCodeBlock = false;
    let codeContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${i}`} className="p-3 bg-[#121214] border border-[#27272a] text-[11px] font-mono text-emerald-400 overflow-x-auto my-2 whitespace-pre leading-relaxed">
              {codeContent.join("\n")}
            </pre>
          );
          codeContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      if (line.trim().startsWith("|")) {
        if (line.includes("---")) {
          continue;
        }
        const cells = line.split("|").slice(1, -1);
        if (!inTable) {
          inTable = true;
          tableHeaders = cells;
        } else {
          tableRows.push(cells);
        }
        continue;
      } else {
        if (inTable) {
          flushTable(i.toString());
        }
      }

      if (line.trim().startsWith("###")) {
        elements.push(
          <h4 key={i} className="text-xs font-bold font-mono text-indigo-300 mt-4 mb-2 uppercase tracking-wide border-b border-[#27272a] pb-1">
            {line.replace("###", "").trim()}
          </h4>
        );
        continue;
      }
      if (line.trim().startsWith("##")) {
        elements.push(
          <h3 key={i} className="text-sm font-bold font-mono text-emerald-400 mt-4 mb-2 uppercase tracking-wide border-b border-[#27272a] pb-1">
            {line.replace("##", "").trim()}
          </h3>
        );
        continue;
      }

      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        elements.push(
          <div key={i} className="flex items-start space-x-2 pl-2 my-1 text-xs text-gray-300">
            <span className="text-emerald-400 font-bold font-mono select-none">•</span>
            <span>{line.substring(2).trim()}</span>
          </div>
        );
        continue;
      }

      if (line.trim()) {
        elements.push(
          <p key={i} className="text-xs text-gray-300 leading-relaxed my-1.5 font-mono">
            {line}
          </p>
        );
      }
    }

    if (inTable) {
      flushTable("final");
    }

    return elements;
  };

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

      <div className="p-5 space-y-4">
        <p className="text-xs text-gray-400 leading-relaxed font-sans border-l-2 border-indigo-500 pl-3 italic bg-[#121214]/50 py-1.5">
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
