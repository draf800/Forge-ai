"use client";

import type { GeneratedFile } from "@/lib/groq";

// Inlines styles.css and script.js into index.html so it can preview with zero build step.
function buildSrcDoc(files: GeneratedFile[]): string {
  const html = files.find((f) => f.path === "index.html")?.content || "<p>No index.html generated.</p>";
  const css = files.find((f) => f.path === "styles.css")?.content || "";
  const js = files.find((f) => f.path === "script.js")?.content || "";

  return html
    .replace('<link rel="stylesheet" href="styles.css">', `<style>${css}</style>`)
    .replace(/<link[^>]*styles\.css[^>]*>/, `<style>${css}</style>`)
    .replace('<script src="script.js"></script>', `<script>${js}</script>`)
    .replace(/<script[^>]*src="script\.js"[^>]*><\/script>/, `<script>${js}<\/script>`);
}

export default function PreviewPane({ files }: { files: GeneratedFile[] }) {
  if (files.length === 0) {
    return (
      <div className="flex h-full items-center justify-center border border-forge-line bg-forge-panel text-sm text-forge-mute">
        Preview appears here once a site is generated.
      </div>
    );
  }

  return (
    <iframe
      title="preview"
      srcDoc={buildSrcDoc(files)}
      className="h-full w-full border border-forge-line bg-white"
      sandbox="allow-scripts allow-forms"
    />
  );
}
