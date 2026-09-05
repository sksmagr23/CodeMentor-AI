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
        <div className="p-3 border-2 border-accent bg-paper-elevated shadow-hard-sm text-xs text-ink space-y-1.5">
          {(time_complexity || space_complexity) && (
            <div className="flex items-center gap-3 font-mono text-[11px] text-muted flex-wrap">
              {time_complexity && (
                <span className="border-2 border-accent px-2 py-1 font-medium bg-paper">
                  Time: <strong className="text-warn">{time_complexity}</strong>
                </span>
              )}
              {space_complexity && (
                <span className="border-2 border-accent px-2 py-1 font-medium bg-paper">
                  Space: <strong className="text-accent-bright">{space_complexity}</strong>
                </span>
              )}
            </div>
          )}
          {explanation && (
            <p className="leading-relaxed text-ink">
              {renderSafeText(explanation)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
