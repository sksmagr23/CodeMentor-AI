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
    <div className="panel-brutal my-3 text-ink overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-paper border-b-2 border-accent">
        <div className="flex items-center gap-2.5">
          <div className="border-2 border-accent bg-accent-soft text-accent-bright p-2 shadow-hard-sm">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-base text-ink">
              {title} {problem_title && `• ${problem_title}`}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {algorithm && (
                <span className="border-2 border-accent px-2 py-1 text-xs font-medium font-mono bg-accent-soft text-accent-bright">
                  {algorithm}
                </span>
              )}
              <span className="text-[11px] font-mono text-muted">
                Input: {input_used}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 border-2 border-accent px-2 py-1 text-xs font-medium bg-paper-elevated hover:bg-accent-soft text-ink shadow-hard-sm transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Full View</span>
          </button>
        </div>
      </div>

      <div className="p-4 bg-paper-elevated flex flex-col items-center justify-center border-b-2 border-accent">
        <div
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer group relative overflow-hidden border-2 border-accent bg-paper shadow-hard-sm transition-all hover:shadow-hard max-w-full"
        >
          <img
            src={image_url}
            alt={title}
            className="max-h-95 w-auto object-contain transition-transform group-hover:scale-[1.01]"
          />
          <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="border-2 border-accent px-2 py-1 text-xs font-medium bg-paper-elevated text-accent-bright shadow-hard-sm">
              Click to expand
            </span>
          </div>
        </div>
      </div>

      {steps && steps.length > 0 && (
        <div className="p-4 bg-paper text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-ink mb-2">
            <ListOrdered className="w-3.5 h-3.5 text-accent-bright" />
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
                  className="flex items-start gap-2 p-2 border-2 border-accent bg-paper-elevated font-mono text-ink text-[11px] shadow-hard-sm"
                >
                  <span className="border-2 border-accent px-2 py-1 text-xs font-medium bg-accent-soft text-accent-bright">
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
        <div className="px-4 py-3 bg-paper-elevated text-xs text-muted border-t-2 border-accent leading-relaxed">
          {explanation}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4">
          <div className="relative max-w-5xl max-h-[90vh] bg-paper-elevated border-2 border-accent shadow-hard-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-3.5 bg-paper border-b-2 border-accent">
              <h4 className="text-sm font-display text-ink">{title}</h4>
              <div className="flex items-center gap-2">
                <a
                  href={image_url}
                  download="dsa-dry-run.png"
                  className="p-1.5 border-2 border-accent bg-paper-elevated hover:bg-accent-soft text-muted hover:text-ink transition-colors shadow-hard-sm"
                  title="Download Image"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 border-2 border-accent bg-paper-elevated hover:bg-accent-soft text-muted hover:text-ink transition-colors shadow-hard-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-auto flex items-center justify-center bg-paper-elevated">
              <img src={image_url} alt={title} className="max-h-[75vh] w-auto object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
