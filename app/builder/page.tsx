"use client";

import { useState } from "react";
import JSZip from "jszip";
import FileExplorer from "@/components/FileExplorer";
import PreviewPane from "@/components/PreviewPane";
import type { GeneratedFile, GeneratedSite } from "@/lib/groq";
import { addPwaSupport } from "@/lib/pwa";
import { supabaseBrowser } from "@/lib/supabase";

type Turn = { role: "you" | "app"; text: string };

export default function Builder() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [site, setSite] = useState<GeneratedSite | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [saveStatus, setSaveStatus] = useState("");
  const [installable, setInstallable] = useState(false);
  const [activateStatus, setActivateStatus] = useState("");

  const hasBackend = !!site?.files.some((f) => f.path.startsWith("server/"));

  async function handleGenerate() {
    if (!prompt.trim() || loading) return;
    const instruction = prompt;
    setLoading(true);
    setError("");
    setSaveStatus("");
    setActivateStatus("");
    setTurns((t) => [...t, { role: "you", text: instruction }]);
    setPrompt("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: instruction, existingFiles: site?.files || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed.");
      const files = installable ? addPwaSupport(data.files, instruction.slice(0, 30)) : data.files;
      setSite({ ...data, files });
      setTurns((t) => [...t, { role: "app", text: data.summary }]);
    } catch (err: any) {
      setError(err.message);
      setTurns((t) => [...t, { role: "app", text: "Error: " + err.message }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleTogglePwa(checked: boolean) {
    setInstallable(checked);
    if (checked && site) {
      setSite({ ...site, files: addPwaSupport(site.files, turns[0]?.text?.slice(0, 30) || "App") });
    }
  }

  async function handleActivateBackend() {
    if (!site) return;
    setActivateStatus("Activating…");
    const res = await fetch("/api/write-files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files: site.files }),
    });
    const data = await res.json();
    setActivateStatus(res.ok ? "Live at: " + data.written.join(", ") : data.error);
  }

  async function handleDeploy() {
    if (!site) return;
    setError("");
    setSaveStatus("Deploying…");
    const res = await fetch("/api/deploy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files: site.files, projectName: turns[0]?.text?.slice(0, 30) || "forge-site" }),
    });
    const data = await res.json();
    setSaveStatus("");
    if (data.url) window.open(data.url, "_blank");
    else setError(data.error || "Deploy failed.");
  }

  async function handleSave() {
    if (!site) return;
    setSaveStatus("Saving…");
    const supabase = supabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaveStatus(""); window.location.href = "/login"; return; }
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: turns[0]?.text?.slice(0, 60) || "Untitled", prompt: turns.map((t) => t.text).join(" / "), files: site.files }),
    });
    setSaveStatus(res.ok ? "Saved." : "Save failed.");
  }

  async function handleDownload() {
    if (!site) return;
    const zip = new JSZip();
    site.files.forEach((f: GeneratedFile) => zip.file(f.path, f.content));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "site.zip";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleTestPayment() {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productName: "Test item", amountCents: 500 }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setError(data.error || "Checkout failed.");
  }

  return (
    <main className="flex h-screen flex-col bg-forge-bg text-forge-paper">
      <header className="flex items-center justify-between border-b border-forge-line px-6 py-3">
        <span className="font-mono text-sm text-forge-mute">forge ai / builder</span>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-forge-mute">
            <input type="checkbox" checked={installable} onChange={(e) => handleTogglePwa(e.target.checked)} className="accent-forge-ember" />
            Installable (PWA)
          </label>
          {hasBackend && (
            <button onClick={handleActivateBackend} className="rounded-sm border border-forge-line px-3 py-1.5 text-xs hover:border-forge-brass">
              Activate backend
            </button>
          )}
          <button onClick={handleTestPayment} className="rounded-sm border border-forge-line px-3 py-1.5 text-xs hover:border-forge-brass">
            Test checkout
          </button>
          <button onClick={handleDownload} disabled={!site} className="rounded-sm border border-forge-line px-3 py-1.5 text-xs hover:border-forge-brass disabled:opacity-40">
            Download .zip
          </button>
          <button onClick={handleDeploy} disabled={!site} className="rounded-sm bg-forge-ember px-3 py-1.5 text-xs font-medium text-forge-bg disabled:opacity-40">
            Deploy live
          </button>
          <button onClick={handleSave} disabled={!site} className="rounded-sm bg-forge-brass px-3 py-1.5 text-xs font-medium text-forge-bg disabled:opacity-40">
            {saveStatus || "Save project"}
          </button>
        </div>
      </header>
      <div className="flex flex-1 gap-3 overflow-hidden p-3">
        <div className="flex w-full max-w-sm flex-col gap-3">
          <div className="scrollbar-thin flex-1 overflow-y-auto rounded-sm border border-forge-line bg-forge-panel p-3">
            {turns.length === 0 && (
              <p className="text-sm text-forge-mute">Describe a site to start. After the first build, keep chatting to refine it.</p>
            )}
            {turns.map((t, i) => (
              <div key={i} className={"mb-3 text-sm " + (t.role === "you" ? "text-forge-paper" : "text-forge-mute")}>
                <span className="font-mono text-xs text-forge-brass">{t.role === "you" ? "you" : "built"} </span>
                {t.text}
              </div>
            ))}
          </div>
          {activateStatus && <p className="text-xs text-forge-mute">{activateStatus}</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}
          {site?.suggestedTables && site.suggestedTables.length > 0 && (
            <div className="rounded-sm border border-forge-line bg-forge-panel p-3 text-xs">
              <p className="mb-1 text-forge-brass">Suggested database tables</p>
              {site.suggestedTables.map((t) => (
                <p key={t.name} className="text-forge-mute">{t.name}: {t.columns.join(", ")}</p>
              ))}
            </div>
          )}
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
            placeholder={site ? "Keep refining: 'add a pricing section', 'make it dark mode'…" : "Describe the site you want to build…"}
            className="h-24 resize-none rounded-sm border border-forge-line bg-forge-panel p-3 text-sm outline-none focus:border-forge-ember"
          />
          <button onClick={handleGenerate} disabled={loading} className="rounded-sm bg-forge-ember px-4 py-2 text-sm font-medium text-forge-bg hover:brightness-110 disabled:opacity-50">
            {loading ? "Building…" : site ? "Apply change" : "Build it"}
          </button>
          <div className="h-48 shrink-0 overflow-hidden">
            <FileExplorer files={site?.files || []} />
          </div>
        </div>
        <div className="flex-1">
          <PreviewPane files={site?.files || []} />
        </div>
      </div>
    </main>
  );
}
