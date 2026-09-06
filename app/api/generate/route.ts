import { NextRequest, NextResponse } from "next/server";
import { generateSite, editSite } from "@/lib/groq";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GROQ_API_KEY. Add a free key from console.groq.com to .env.local." },
      { status: 500 }
    );
  }

  const { prompt, existingFiles } = await req.json();
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }

  try {
    const site =
      existingFiles && Array.isArray(existingFiles) && existingFiles.length > 0
        ? await editSite(prompt, existingFiles, apiKey)
        : await generateSite(prompt, apiKey);
    return NextResponse.json(site);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Generation failed." }, { status: 500 });
  }
}
