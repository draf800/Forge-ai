// Free AI code generation via Groq (https://console.groq.com).
// Groq's free tier needs no credit card and is fast enough for interactive use.

export type GeneratedFile = { path: string; content: string };
export type GeneratedSite = {
  summary: string;
  files: GeneratedFile[];
  suggestedTables?: { name: string; columns: string[] }[];
};

const SYSTEM_PROMPT = `You are a senior full-stack web developer. A user will describe a website or small app.

Respond with ONLY a single JSON object (no markdown fences, no commentary) shaped exactly like this:

{
  "summary": "one sentence describing what you built",
  "files": [
    { "path": "index.html", "content": "..." },
    { "path": "styles.css", "content": "..." },
    { "path": "script.js", "content": "..." },
    { "path": "server/api.js", "content": "..." }
  ],
  "suggestedTables": [
    { "name": "signups", "columns": ["id", "email", "created_at"] }
  ]
}

Rules:
- Always include a self-contained "index.html" that links "styles.css" and "script.js" by relative path, so the site can be previewed instantly in an iframe with no build step.
- Write real, working, complete code — no "// TODO" placeholders, no truncated sections.
- If the site needs a backend (forms, data, accounts), also include one or more files under "server/" containing Next.js-style API route handlers (export async function POST(req) {...}) that the user can drop into a Next.js app's app/api folder later. Reference them from script.js using fetch("/api/...") even though they won't run in the static preview — note this in "summary".
- If the site needs to store data, include "suggestedTables" describing simple table names and columns for Postgres/Supabase. Omit this field if no data storage is needed.
- Design with real intention: a clear color palette and typographic hierarchy suited to the subject, not generic centered-hero-with-three-cards defaults.
- Keep everything in valid JSON: escape quotes and newlines properly inside the "content" strings.`;

const EDIT_SYSTEM_PROMPT = `You are a senior full-stack web developer editing an existing generated site.

You will be given the CURRENT files as JSON, then an instruction describing a change.
Respond with ONLY a single JSON object in the exact same shape as before:

{ "summary": "...", "files": [...], "suggestedTables": [...] }

Rules:
- Return the FULL, complete set of files for the site after the change — not a diff,
  not just the changed file. Carry over every file untouched unless the instruction
  implies it should change.
- Make the smallest change that satisfies the instruction. Don't redesign things the
  user didn't ask about.
- Keep the same rules as before: complete working code, no placeholders, index.html
  links styles.css and script.js by relative path for instant preview.`;

async function callGroq(apiKey: string, systemPrompt: string, userContent: string): Promise<GeneratedSite> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.4,
      max_tokens: 8000,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Groq returned no content");

  let parsed: GeneratedSite;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Model did not return valid JSON. Try rephrasing the prompt.");
  }

  if (!parsed.files || !Array.isArray(parsed.files) || parsed.files.length === 0) {
    throw new Error("Model response had no files.");
  }

  return parsed;
}

export async function generateSite(userPrompt: string, apiKey: string): Promise<GeneratedSite> {
  return callGroq(apiKey, SYSTEM_PROMPT, userPrompt);
}

export async function editSite(
  instruction: string,
  currentFiles: GeneratedFile[],
  apiKey: string
): Promise<GeneratedSite> {
  const userContent = `CURRENT FILES:\n${JSON.stringify(currentFiles)}\n\nINSTRUCTION: ${instruction}`;
  return callGroq(apiKey, EDIT_SYSTEM_PROMPT, userContent);
}
