import React from "react";

export const parseInlineStyles = (text: string): React.ReactNode[] => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 bg-[#27272a] text-amber-300 font-mono text-[10px] border border-[#3f3f46] mx-0.5"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

export const renderMarkdown = (text: string): React.ReactNode => {
  if (!text) return null;
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith("```")) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      const language = match ? match[1] : "";
      const codeContent = match ? match[2] : part.slice(3, -3);

      return (
        <pre
          key={index}
          className="bg-[#0f0f11] p-3 border border-[#27272a] text-gray-200 font-mono text-[11px] overflow-x-auto my-2 rounded-none"
        >
          {language && (
            <div className="text-[10px] text-gray-500 font-sans uppercase mb-1 border-b border-[#27272a] pb-1 select-none">
              {language}
            </div>
          )}
          <code>{codeContent.trim()}</code>
        </pre>
      );
    }

    const lines = part.split("\n");
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];

    const flushList = (keyPrefix: number) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${keyPrefix}`} className="list-disc pl-5 my-2 space-y-1 text-gray-300">
            {listItems}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, lineIdx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith("### ")) {
        flushList(lineIdx);
        elements.push(
          <h3 key={lineIdx} className="text-xs font-bold text-emerald-400 mt-3 mb-1 uppercase tracking-wider font-display">
            {parseInlineStyles(trimmed.slice(4))}
          </h3>
        );
      } else if (trimmed.startsWith("## ")) {
        flushList(lineIdx);
        elements.push(
          <h2 key={lineIdx} className="text-sm font-bold text-white mt-4 mb-1.5 uppercase tracking-wide font-display">
            {parseInlineStyles(trimmed.slice(3))}
          </h2>
        );
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        listItems.push(
          <li key={lineIdx} className="leading-relaxed">
            {parseInlineStyles(trimmed.slice(2))}
          </li>
        );
      } else if (trimmed === "") {
        flushList(lineIdx);
      } else {
        flushList(lineIdx);
        elements.push(
          <p key={lineIdx} className="my-1.5 leading-relaxed">
            {parseInlineStyles(line)}
          </p>
        );
      }
    });

    flushList(lines.length);
    return <React.Fragment key={index}>{elements}</React.Fragment>;
  });
};
