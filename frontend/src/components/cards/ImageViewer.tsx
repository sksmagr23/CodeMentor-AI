import React, { useState } from 'react';
import type { DryRunImageData } from '../../types/dsa';
import { Image as ImageIcon, Maximize2, X, Download, ListOrdered } from 'lucide-react';

export const ImageViewer: React.FC<DryRunImageData> = ({
  title,
  problem_title,
  input_used,
  algorithm,
  steps,
  explanation,
  image_url,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-slate-900/90 shadow-xl my-3 text-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-['Space_Grotesk'] text-sm font-semibold text-slate-100">
              {title} {problem_title && `• ${problem_title}`}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              {algorithm && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-['JetBrains_Mono']">
                  {algorithm}
                </span>
              )}
              <span className="text-[11px] font-['JetBrains_Mono'] text-slate-400">
                Input: {input_used}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Full View</span>
          </button>
        </div>
      </div>

      <div className="p-4 bg-slate-950/80 flex flex-col items-center justify-center border-b border-slate-800/80">
        <div
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer group relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 transition-all hover:border-cyan-500/50 max-w-full"
        >
          <img
            src={image_url}
            alt={title}
            className="max-h-95 w-auto object-contain rounded-lg transition-transform group-hover:scale-[1.01]"
          />
          <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="px-3 py-1 rounded-full bg-slate-900/90 text-cyan-300 text-xs font-medium border border-cyan-500/30">
              Click to expand
            </span>
          </div>
        </div>
      </div>

      {steps && steps.length > 0 && (
        <div className="p-4 bg-slate-900 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-2">
            <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />
            <span>Step-by-Step Trace</span>
          </div>
          <div className="space-y-1.5">
            {steps.map((stepItem: any, idx: number) => {
              const stepText =
                typeof stepItem === 'string'
                  ? stepItem
                  : typeof stepItem === 'object' && stepItem !== null
                  ? stepItem.description
                    ? stepItem.step
                      ? `Step ${stepItem.step}: ${stepItem.description}`
                      : String(stepItem.description)
                    : stepItem.text || stepItem.detail || JSON.stringify(stepItem)
                  : String(stepItem || '');

              return (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2 rounded bg-slate-950/50 border border-slate-800/60 font-['JetBrains_Mono'] text-slate-300 text-[11px]"
                >
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{stepText}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {explanation && (
        <div className="px-4 py-3 bg-slate-950 text-xs text-slate-400 border-t border-slate-800 leading-relaxed">
          {explanation}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-3.5 bg-slate-950 border-b border-slate-800">
              <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
              <div className="flex items-center gap-2">
                <a
                  href={image_url}
                  download="dsa-dry-run.png"
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Download Image"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-auto flex items-center justify-center bg-slate-950">
              <img src={image_url} alt={title} className="max-h-[75vh] w-auto object-contain rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
