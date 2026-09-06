'use client';

import React, { useState } from 'react';

interface File {
  path: string;
  content: string;
}

interface FileExplorerProps {
  files: File[];
}

export default function FileExplorer({ files }: FileExplorerProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  if (!files || files.length === 0) {
    return (
      <div className="p-4 text-forge-mute bg-forge-panel border border-forge-line rounded">
        No files to display
      </div>
    );
  }

  const activeFile = files[activeIndex] ?? files[0];

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center space-x-1 border-b border-forge-line bg-forge-panel">
        {files.map((f, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={f.path}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`px-3 py-2 text-sm -mb-px focus:outline-none transition-colors ${
                isActive
                  ? 'border-b-2 border-forge-brass text-forge-paper bg-forge-panel'
                  : 'border-b-2 border-transparent text-forge-mute hover:text-forge-paper'
              }`}
              aria-pressed={isActive}
              aria-label={`Open ${f.path}`}
            >
              {f.path}
            </button>
          );
        })}
      </div>

      {/* File content */}
      <div className="flex-1 overflow-auto bg-forge-panel border border-forge-line p-4">
        <pre className="whitespace-pre-wrap text-sm text-forge-paper">
          <code>{activeFile.content}</code>
        </pre>
      </div>
    </div>
  );
}
