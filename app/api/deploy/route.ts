import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = process.env.VERCEL_DEPLOY_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Missing VERCEL_DEPLOY_TOKEN" }, { status: 500 });
  }

  const { files, projectName } = await req.json();

  const slug = (projectName || "forge-site")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .slice(0, 30);

  const vercelFiles = files.map((f: { path: string; content: string }) => ({
    file: f.path,
    data: f.content,
  }));

  const res = await fetch("https://api.vercel.com/v13/deployments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: slug,
      files: vercelFiles,
      projectSettings: { framework: null },
      target: "production",
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: data.error?.message || "Deploy failed" }, { status: 500 });
  }

  return NextResponse.json({ url: `https://${data.alias?.[0] || data.url}` });
}
