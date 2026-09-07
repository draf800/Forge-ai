"use client";

import { useState } from "react";

type GeneratedFile = { path: string; content: string };

export default function FileExplorer({ files }: { files: GeneratedFile[] }) {
  const [active, setActive] = useState(0);
  if (files.length === 0) return null;

  return (
    <div className="flex h-full flex-col border border-forge-line bg-forge-panel">
      <div className="flex overflow-x-auto border-b border-forge-line">
        {files.map((f, i) => (
          <button
            key={f.path}
            onClick={() => setActive(i)}
            className={`whitespace-nowrap px-4 py-2 font-mono text-xs ${
              i === active
                ? "border-b-2 border-forge-ember text-forge-paper"
                : "text-forge-mute hover:text-forge-paper"
            }`}
          >
            {f.path}
          </button>
        ))}
      </div>
      <pre className="scrollbar-thin flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-forge-paper">
        {files[active].content}
      </pre>
    </div>
  );
}
