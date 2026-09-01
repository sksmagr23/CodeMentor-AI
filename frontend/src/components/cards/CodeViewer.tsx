import React from 'react';
import type { CodeViewerData } from '../../types/dsa';
import { CodeEditor } from '../common/CodeEditor';
import { renderSafeText } from '../../utils/safeText';

export const CodeViewer: React.FC<CodeViewerData> = ({
  title = 'Code Implementation',
  code,
  language = 'cpp',
  explanation,
  time_complexity,
  space_complexity,
}) => {
  const lineCount = (code || '').split('\n').length;
  const height = Math.min(Math.max(lineCount * 21 + 45, 140), 380);

  return (
    <div className="my-3 space-y-2">
      <CodeEditor
        value={code || ''}
        language={language}
        readOnly={true}
        height={`${height}px`}
        title={title}
      />

      {(time_complexity || space_complexity || explanation) && (
        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1.5 shadow-sm">
          {(time_complexity || space_complexity) && (
            <div className="flex items-center gap-3 font-['JetBrains_Mono'] text-[11px] text-slate-400">
              {time_complexity && (
                <span>
                  Time: <strong className="text-amber-300">{time_complexity}</strong>
                </span>
              )}
              {space_complexity && (
                <span>
                  Space: <strong className="text-cyan-300">{space_complexity}</strong>
                </span>
              )}
            </div>
          )}
          {explanation && (
            <p className="leading-relaxed text-slate-300">
              {renderSafeText(explanation)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
